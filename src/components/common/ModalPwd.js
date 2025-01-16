import React, { useState } from "react";
import "../../assets/css/modal.css";

const ModalPwd = (props) => {
  const { open, close, header, modalPwdAfterName, pwd, goBoardReg, delBoard } =
    props;

  let [inputPwd, setInputPwd] = useState();

  const checkPwd = (e) => {
    e.preventDefault();
    if (inputPwd === pwd) {
      if (modalPwdAfterName === "reg") {
        goBoardReg(e);
      } else {
        delBoard(e);
      }
    } else {
      alert("비밀번호가 틀립니다");
    }
  };

  return (
    <div className={open ? "openModal modal" : "modal"}>
      {open ? (
        <>
          <section>
            <div id="pop-wrap">
              <h1 className="pop-tit">{header}</h1>
              <div className="pop-con">
                <table className="view">
                  <colgroup>
                    <col style={{ width: "100px" }} />
                    <col />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th>비밀번호</th>
                      <td>
                        <input
                          type="password"
                          className="input"
                          style={{ width: "200px" }}
                          onChange={(e) => {
                            setInputPwd(e.target.value);
                          }}
                        />
                        <a
                          href="#!"
                          className="btn btn-red"
                          onClick={(e) => checkPwd(e)}
                        >
                          확인
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="btn-box">
                  <a href="#!" className="btn btn-default" onClick={close}>
                    닫기
                  </a>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
};

export default ModalPwd;
