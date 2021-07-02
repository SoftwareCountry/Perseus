import { Arrow } from '@models/arrow';
import { MockArrow, MockComponent } from '@app/test/mock';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { Renderer2, Type } from '@angular/core';
import { classToPlain } from 'class-transformer';
import { IConnector } from '@models/connector.interface';

describe('Arrow', () => {

  let renderer: Renderer2

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [Renderer2]
    }).compileComponents();
  }));

  beforeEach(() => {
    const fixture = TestBed.createComponent(MockComponent)
    renderer = fixture.componentRef.injector.get<Renderer2>(Renderer2 as Type<Renderer2>);
  });

  it('should remove unnecessary fields for prepare to save in a file', () => {
    const connector: IConnector = new MockArrow(renderer)
    const state = classToPlain(connector)
    const deletedFields = ['canvas', 'path', 'button', 'clicked', 'sourceSVGPoint',
      'targetSVGPoint', 'title', 'titleText', 'removeClickListener', 'renderer']
    const resultFields = Object.keys(state)

    expect(
      deletedFields.every(field => !resultFields.includes(field))
    ).toBeTrue()
  })
})
