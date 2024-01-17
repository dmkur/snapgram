import ReasctDom from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

ReasctDom.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
