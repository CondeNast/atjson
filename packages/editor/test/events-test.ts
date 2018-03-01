import events from '../src/mixins/events';

describe('events', () => {
  test('delegation of events', {
    class DelegationTest extends events(HTMLElement) {
      static events = {
        click: 'click'
      };
    }
    customElements.define('delegation-test', DelegationTest);

    document.createElement('delegation-test');
  });
});
