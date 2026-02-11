import { Routers } from "./Routers/Routers";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <Routers />
      <Toaster position="top-right" />
    </>
  );
};

export default App;
