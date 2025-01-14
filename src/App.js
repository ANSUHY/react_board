import "./assets/css/style.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/layout/Header";
import Bottom from "./components/layout/Bottom";

import Lnav from "./components/layout/Lnav";
import Rnav from "./components/layout/Rnav";
import BoardListPage from "./components/BoardListPage";
import SubHeader from "./components/layout/SubHeader";

function App() {
  return (
    <BrowserRouter>
      <div id="wrap">
        <Header />
        <div id="container">
          <Lnav />

          <div id="contents">
            <SubHeader />
            <Routes>
              <Route path="/" element={<BoardListPage />} />
            </Routes>
          </div>
          {/* <!-- /contents --> */}
        </div>
        {/* <!-- /container --> */}

        <Rnav />
      </div>
      <Bottom />
    </BrowserRouter>
  );
}

export default App;
