
#!/bin/sh

export BuildFolder=$1
mkdir $BuildFolder
cd $BuildFolder

git clone https://github.com/SoftwareCountry/DataQualityDashboard.git
git clone https://github.com/SoftwareCountry/ETL-CDMBuilder.git
git clone https://github.com/SoftwareCountry/WhiteRabbit.git
git clone https://github.com/SoftwareCountry/CDMSouffleur.git

echo [END]
