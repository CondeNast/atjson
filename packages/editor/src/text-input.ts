import events from './mixins/events';

type Constructor<T = {}> = new (...args: any[]) => T;

const supports = {
  beforeinput: InputEvent.prototype.hasOwnProperty('inputType')
};

function getRangeFrom() {

}

/**
 * The keyboard mixin normalizes keyboard input across browsers.
 * This is due to varying levels of support by browser vendors
 * of different Web APIs. The Input Events API provides a fairly
 * robust set of events that we can use to correctly detect input
 * from people fluent in CJK languages (Chinese, Japanese, and Korean).
 * These languages share a feature that _most_ input methods are
 * done through a series of characters.
 *
 * For example, in Japanese, the following sequence of roman
 * characters will result in the following set of text:
 *
 * | w | wa | wat | wata | watas | watash | watashi |
 * | w | わ | わt | わた | わたs | わたsh | 私      |
 *
 * This results in text that does not map 1:1 to the keys that
 * the person typed on their keyboard.
 *
 * This is the same series of events that we receive from
 * autocorrect and predictive text keyboards.
 *
 * Our approach here is to do the best we can to get the most
 * accurate set of events from the user's keyboard. We can only
 * promise accuracy to the level of what is provided by the
 * fidelity of the web API that's available for use in the browser.
 */
class TextInput extends events(HTMLElement) {
  static events = {
    'beforeinput': 'beforeinput',
    'change text-selection'(evt) {
      this.selection = evt.detail;
    }
    'clear text-selection'() {
      this.selection = null;
    }
  };
  private selection?: { start: number, end: number, collapsed: boolean } | null;

  beforeinput(evt: InputEvent) {
    let ranges = evt.getTargetRanges();
    let { start, end } = this.selection;
    console.log(this.selection);
     debugger;
    switch (evt.inputType) {
    case 'insertText':
      this.dispatchEvent(new CustomEvent('insertText', [start, evt.data]));
      break;
    case 'insertLineBreak':
      this.dispatchEvent(new CustomEvent('insertText', [start, '\u2028', true]));
      new CustomEvent('addAnnotation', {
        type: 'line-break',
        start,
        end: end + 1
      });
      break;
    case 'deleteContentBackward':
      if (this.selection.collapsed) {
        start--;
      }
      this.dispatchEvent(new CustomEvent('deleteText', {
        start,
        end
      }));
      break;
    case 'deleteContentForward':

      if (this.selection.collapsed) {
        end++;
      }
      this.dispatchEvent(new CustomEvent('deleteText', {
        start,
        end
      }));
      break;
    }
  }
};

customElements.define('text-input', TextInput);

export default TextInput;