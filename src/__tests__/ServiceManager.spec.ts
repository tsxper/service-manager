import { ServiceManager } from '../ServiceManager';

describe('ServiceManager', () => {
  it('returns keys', () => {
    const sm = new ServiceManager({
      'key1': () => 10,
      'key2': async () => 20,
    });
    const keys = sm.getKeys();
    expect(keys).toMatchObject(['key1', 'key2']);
  });

  it('adds keys', () => {
    const sm = new ServiceManager({
      'key1': () => null
    }).add('key2', () => null);
    expect(sm.getKeys()).toMatchObject(['key1', 'key2']);
  });

  it('error on unknown', async () => {
    const sm = new ServiceManager({ 'unknown': () => null });
    sm.destroy();
    expect(async () => sm.get('unknown')).rejects.toThrow();
  });

  it('retrieve instances', async () => {
    const sm = new ServiceManager({
      'myservice1': () => new Uint32Array(),
      'myservice2': async () => new Uint8Array(),
    });
    const service1 = sm.get('myservice1');
    expect(service1 instanceof Uint32Array).toBe(true);

    const service1_1 = sm.get('myservice1');
    expect(service1 === service1_1).toBe(true);

    const service1_2 = sm.get('myservice1', true);
    expect(service1 !== service1_2).toBe(true);

    const service2 = await sm.get('myservice2');
    expect(service2 instanceof Uint8Array).toBe(true);

    const service2_1 = await sm.get('myservice2');
    expect(service2 === service2_1).toBe(true);

    const service2_2 = await sm.get('myservice2', true);
    expect(service2 !== service2_2).toBe(true);
  });

  it('cached and non-cached instances', async () => {
    class Fruit {
      constructor(public weight: number) { }
    }
    const sm = new ServiceManager({
      'fruit1': () => new Fruit(11),
      'fruit2': async () => new Fruit(22),
    });
    const instance_10 = sm.get('fruit1');
    const instance_11 = sm.get('fruit1');
    expect(instance_10 === instance_11).toBe(true);
    const instance_12 = sm.get('fruit1', true);
    expect(instance_10 === instance_12).toBe(false);

    const instance_20 = await sm.get('fruit2');
    const instance_21 = await sm.get('fruit2');
    expect(instance_20 === instance_21).toBe(true);
    const instance_22 = await sm.get('fruit2', true);
    expect(instance_20 === instance_22).toBe(false);
  });

  it('replace instance with a subclass', async () => {
    class Fruit {
      constructor(public weight: number) { }
    }
    class Apple extends Fruit {
      name = 'apples';
      constructor(w: number) {
        super(w);
      }
    }
    const sm = new ServiceManager({
      'fruit1': () => new Fruit(11),
      'fruit2': async () => new Fruit(22),
    });
    const i_10 = sm.get('fruit1');
    expect(i_10.weight).toBe(11);
    const i_12 = await sm.get('fruit2');
    expect(i_12.weight).toBe(22);

    const sm1 = sm.replace('fruit1', () => new Apple(12));
    const i_20 = sm1.get('fruit1');
    expect(i_20 instanceof Fruit).toBe(true);
    expect(i_20 instanceof Apple).toBe(true);
    expect(i_20.weight).toBe(12);
    expect(i_20.name).toBe('apples');

    const sm2 = sm1.replace('fruit2', async () => new Apple(23));
    const i_30 = await sm2.get('fruit2');
    expect(i_30 instanceof Fruit).toBe(true);
    expect(i_30 instanceof Apple).toBe(true);
    expect(i_30.weight).toBe(23);
    expect(i_30.name).toBe('apples');
  });
});
