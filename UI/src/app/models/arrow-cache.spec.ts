import { ArrowCachePlain, IArrowCache } from '@models/arrow-cache';
import { MockComponent, MockConnection } from '@app/test/mock';
import { Renderer2, Type } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';

describe('ArrowCache', () => {

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
    const cache: IArrowCache = {
      'test-key': new MockConnection(renderer)
    }
    const cachePlain = new ArrowCachePlain(cache)
    const deletedArrowFields = ['canvas', 'path', 'button', 'clicked', 'sourceSVGPoint',
      'targetSVGPoint', 'title', 'titleText', 'removeClickListener', 'renderer']
    const deletedRowFields = ['htmlElement']
    const json = JSON.stringify(cachePlain)

    expect(
      [...deletedArrowFields, ...deletedRowFields].every(field => !json.includes(field))
    ).toBeTrue()
  })
})
