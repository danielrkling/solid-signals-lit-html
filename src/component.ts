import {
  createEffect,
  createRenderEffect,
  createRoot,
  createSuspense,
  getOwner,
  Owner,
  runWithOwner,
  untrack,
} from "@solidjs/signals";
import { noChange, Part, render } from "lit-html";
import { AsyncDirective, directive } from "lit-html/async-directive.js";

class FunctionComponent<
  TFunction extends (...args: any) => () => unknown
> extends AsyncDirective {
  //Only to give types to the directive
  render(
    owner: Owner | null,
    fb: () => unknown,
    fn: TFunction,
    ...props: Parameters<TFunction>
  ): unknown {
    return;
  }

  dispose: (() => void) | undefined;
  update(
    _part: Part,
    [owner, fb, fn, ...props]: [
      Owner | null,
      () => unknown,
      TFunction,
      ...Parameters<TFunction>
    ]
  ): unknown {
    if (!this.dispose) {
      return runWithOwner(owner, () =>
        createRoot((dispose) => {
          this.dispose = dispose;
          const render = fn(...props)
          const suspense = createSuspense(render, fb);
          createRenderEffect(
            () => {
                render()
                return suspense()
            },
            (v) => {
              this.setValue(v);
            }
          );
          return untrack(()=>suspense())
        })
      );
    }
    return noChange;
  }

  protected disconnected(): void {
    this.dispose?.();
    this.dispose = undefined;
  }
}
const functionComponentDirective = directive(FunctionComponent);

function defaultFallback() {
  return noChange;
}

export function createComponent<
  TFunction extends (...args: any) => () => unknown
>(
  fn: TFunction,
  fallback: () => unknown = defaultFallback
): (...props: Parameters<TFunction>) => unknown {
  return (...props) =>
    functionComponentDirective(getOwner(), fallback, fn, ...props);
}

export function renderRoot(
  rootElem: HTMLElement | DocumentFragment,
  fn: () => unknown
) {
  return createRoot((dispose) => {
    createRenderEffect(
      () => fn(),
      (v) => {
        render(v, rootElem);
      }
    );
    return () => {
      dispose(), rootElem.replaceChildren("");
    };
  });
}
