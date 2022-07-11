import json
import traceback

from flask import jsonify, Blueprint, request
from peewee import DataError
from app import app
from config import APP_PREFIX, VERSION
from model.usagi.code_mapping_conversion import CodeMappingConversion
from model.usagi.code_mapping_conversion_log import CodeMappingConversionLog
from model.usagi.code_mapping_conversion_result import CodeMappingConversionResult
from model.usagi.conversion_status import ConversionStatus
from model.usagi_data.code_mapping import ScoredConceptEncoder
from service.code_mapping_conversion_service import create_conversion, get_conversion, get_logs
from service.filters_service import get_filters
from service.search_service import search_usagi
from service.snapshot_service import get_snapshots_name_list, get_snapshot, delete_snapshot
from service.source_to_concept_map_service import delete_source_to_concept_by_snapshot_name
from service.usagi_service import get_saved_code_mapping, create_concept_mapping, load_codes_to_server, save_codes
from util.async_directive import cancel_concept_mapping_task
from util.constants import QUERY_SEARCH_MODE
from util.exception import InvalidUsage
from util.utils import username_header

usagi = Blueprint('usagi', __name__, url_prefix=APP_PREFIX)


@usagi.route('/api/info', methods=['GET'])
def app_version():
    app.logger.info("REST request to GET app info")
    return jsonify({'name': 'Usagi', 'version': VERSION})


@usagi.route('/api/code-mapping/load-csv', methods=['POST'])
@username_header
def load_csv_for_code_mapping_conversion(current_user):
    app.logger.info("REST request to load CSV file for Code Mapping conversion")
    """save schema to server and load it from server in the same request"""
    try:
        file = request.files['file']
        delimiter = request.form['delimiter']
        codes_file = load_codes_to_server(file, delimiter, current_user)
    except InvalidUsage as error:
        raise error
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500, base=error)
    return jsonify(codes_file)


@usagi.route('/api/code-mapping/launch', methods=['POST'])
@username_header
def launch_code_mapping_conversion(current_user):
    app.logger.info("REST request to launch Code Mapping Conversion")
    try:
        params = request.json['params']
        source_code_column = params['sourceCode']
        source_name_column = params['sourceName']
        source_frequency_column = params['sourceFrequency']
        auto_concept_id_column = params['autoConceptId']
        additional_info_columns = params['additionalInfo']
        concept_ids_or_atc = params['columnType']
        codes = request.json['codes']
        filters = request.json['filters']
        conversion = create_conversion(current_user)
        create_concept_mapping(conversion,
                               current_user,
                               codes,
                               filters,
                               source_code_column,
                               source_name_column,
                               source_frequency_column,
                               auto_concept_id_column,
                               concept_ids_or_atc,
                               additional_info_columns)
    except InvalidUsage as error:
        raise error
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500, base=error)
    return jsonify({'id': conversion.id,
                    'statusCode': conversion.status_code,
                    'statusName': conversion.status_name})


@usagi.route('/api/code-mapping/status', methods=['GET'])
def code_mapping_conversion_status():
    app.logger.info("REST request to GET Code Mapping conversion status")
    try:
        conversion_id = request.args.get('conversionId', None, int)
        if conversion_id is None:
            raise InvalidUsage('Invalid conversion id', 400)
        conversion = get_conversion(conversion_id)
        logs = get_logs(conversion)
    except InvalidUsage as error:
        raise error
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500, base=error)
    return jsonify({
                'id': conversion.id,
                'statusCode': conversion.status_code,
                'statusName': conversion.status_name,
                'logs': [log for log in logs]
                })


@usagi.route('/api/code-mapping/abort', methods=['GET'])
@username_header
def abort_code_mapping_conversion(current_user):
    app.logger.info("REST request to abort Code Mapping conversion")
    cancel_concept_mapping_task(current_user)
    conversion = request.args.get('conversion')
    conversion = CodeMappingConversion.get(CodeMappingConversion.id==conversion)
    CodeMappingConversionLog.create(
                message="Import aborted",
                status_code=ConversionStatus.ABORTED.value,
                status_name=ConversionStatus.ABORTED.name,
                conversion=conversion
            )
    CodeMappingConversionResult.create(result=ConversionStatus.ABORTED.value, conversion=conversion)
    return jsonify('OK')


@usagi.route('/api/code-mapping/result', methods=['GET'])
@username_header
def code_mapping_conversion_result(current_user):
    app.logger.info("REST request to GET Code Mapping conversion result")
    try:
        import_source_codes_results = get_saved_code_mapping(current_user)
    except InvalidUsage as error:
        raise error
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500, base=error)
    return import_source_codes_results


@usagi.route('/api/code-mapping/search-by-term', methods=['POST'])
def get_term_search_results_call():
    app.logger.info("REST request to search by term in Code Mapping conversion result")
    try:
        filters = request.json['filters']
        term = filters['searchString'] if filters['searchMode'] == QUERY_SEARCH_MODE else request.json['term']
        source_auto_assigned_concept_ids = request.json['sourceAutoAssignedConceptIds']
        search_result = search_usagi(filters, term, source_auto_assigned_concept_ids)
    except InvalidUsage as error:
        raise error
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500)
    return json.dumps(search_result, indent=4, cls=ScoredConceptEncoder)


@usagi.route('/api/code-mapping/save', methods=['POST'])
@username_header
def save_mapped_codes_call(current_user):
    app.logger.info("REST request to save code mapping conversion result")
    try:
        codes = request.json['codes']
        mapped_codes = request.json['codeMappings']
        vocabulary_name = request.json['name']
        mapping_params = request.json['mappingParams']
        filters = request.json['filters']
        conversion = request.json['conversionId']
        conversion = CodeMappingConversion.get(CodeMappingConversion.id==conversion)
        result = save_codes(current_user, codes, mapping_params, mapped_codes, filters, vocabulary_name, conversion)
    except DataError as error:
        raise InvalidUsage(error.__str__(), 400, base=error)
    except InvalidUsage as error:
        raise error
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500, base=error)
    return json.dumps(result)


@usagi.route('/api/snapshot/names', methods=['GET'])
@username_header
def snapshots_name_list_call(current_user):
    app.logger.info("REST request to GET snapshots name list")
    result = get_snapshots_name_list(current_user)
    return jsonify(result)


@usagi.route('/api/snapshot', methods=['GET'])
@username_header
def get_snapshot_call(current_user):
    app.logger.info("REST to GET snapshot")
    snapshot_name = request.args['name']
    result = get_snapshot(snapshot_name, current_user)
    return jsonify(result)


@usagi.route('/api/snapshot', methods=['DELETE'])
@username_header
def delete_snapshot_call(current_user):
    app.logger.info("REST request to DELETE snapshot")
    snapshot_name = request.args['name']
    delete_snapshot(snapshot_name, current_user)
    delete_source_to_concept_by_snapshot_name(snapshot_name, current_user)


@usagi.route('/api/filters', methods=['GET'])
def get_filters_call():
    app.logger.info("REST request to GET filters")
    result = get_filters()
    return jsonify(result)


@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    app.logger.error(error.message)
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    traceback.print_tb(error.__traceback__)
    return response


@app.errorhandler(Exception)
def handle_exception(error):
    app.logger.error(error.__str__())
    response = jsonify({'message': error.__str__()})
    response.status_code = 500
    traceback.print_tb(error.__traceback__)
    return response