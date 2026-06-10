import {Test} from '@nestjs/testing';
import {AppController} from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController]
    }).compile();

    controller = moduleRef.get(AppController);
  });

  it('returns health status', () => {
    expect(controller.health()).toEqual({
      status: 'ok',
      service: 'vozilo-api'
    });
  });

  it('lists the first release module boundaries', () => {
    expect(controller.modules()).toEqual(
      expect.arrayContaining(['auth', 'vehicles', 'maintenance', 'workshops', 'forum'])
    );
  });
});
