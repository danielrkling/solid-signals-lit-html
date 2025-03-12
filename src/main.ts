import {
    createAsync,
    createContext,
    createEffect,
    createSignal,
    getContext,
    setContext
} from "@solidjs/signals";
import { html } from "lit-html";
import { createComponent, renderRoot } from "./component";


function Counter(initialCount: () => number) {
  const [count, setCount] = createSignal(initialCount);

  createEffect(() => count(), console.log);

  return () => {
    return html`<button @click=${(e) => setCount((p) => p + 1)}>
      ${getContext(messageContext)()}: ${count()}
    </button>${JSON.stringify(data())}`;
  };
}

const data = createAsync(()=>fetch('https://swapi.dev/api/planets/1').then(r=>r.json()))

const messageContext = createContext(() => "Message");

function App() {
  const [message, setMessage] = createSignal("");
  setContext(messageContext, message);

  return () =>
    html`<div>Counter: ${createComponent(Counter,()=>"Loading")(() => 1)}</div>
      <input @input=${(e) => setMessage(e.target.value)} />
      `;
}

renderRoot(document.body,createComponent(App))

