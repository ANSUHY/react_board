import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ModalPwd from "./common/ModalPwd";

/** Context지정 */
//export const BoardListAshContext = createContext(null);

function BoardDetailPage() {
  /** ===== url매칭을 하기 위함 */
  const navigate = useNavigate();

  /** ===== 파라미터로 넘어온 값 */
  const [searchParams] = useSearchParams();
  let targetBoardNo = searchParams.get("targetBoardNo");

  /** ===== state로 넘어온 값 */
  const { state } = useLocation();
  const urlParamData = state;
  console.log("Detail : state로 넘어온 값 ", urlParamData);

  /** ===== state 지정 */
  let [board, setBoard] = useState(); //게시글데이터
  let [modalPwdOpen, setModalPwdOpen] = useState(false); //modalOpen
  let [modalPwdAfterName, setModalPwdAfterName] = useState(); //모달하고난뒤에 FN

  const openModalPwd = (e, fnName) => {
    e.preventDefault();
    setModalPwdOpen(true);
    setModalPwdAfterName(fnName);
  };
  const closeModal = (e) => {
    e.preventDefault();
    setModalPwdOpen(false);
  };

  /** ===== 디테일 가져오는 function */
  const getBoardDetail = () => {
    console.log("============getBoardDetail", targetBoardNo);

    axios({
      method: "get",
      url: `http://localhost:8080/api/board/detail/${targetBoardNo}`,
    })
      .then((res) => {
        //board 셋팅
        setBoard(res.data);
      })
      .catch((err) => {
        console.log("getBoardDetail : 실패함");
        console.log(err);
      });
  };

  /** ===== 리스트 가는 function */
  const goBoardList = (e) => {
    e.preventDefault();
    console.log("Detail : 넘기는 값", urlParamData);
    navigate(`/`, { state: urlParamData });
  };

  /** ===== Reg 가는 function */
  const goBoardReg = (e) => {
    let param = "targetBoardNo=" + targetBoardNo;
    console.log("Detail : 넘기는 값", urlParamData);
    navigate(`/reg?${param}`, { state: urlParamData });
  };

  /** ===== board 삭제 function */
  const delBoard = async (e) => {
    if (window.confirm("삭제 하시겠습니까?")) {
      await axios
        .delete(`http://localhost:8080/api/board/delete/${targetBoardNo}`, {
          headers: { "content-type": "application/json" },
        })
        .then((res) => {
          //리스트로 가기
          navigate(`/`);
        })
        .catch(() => {
          console.log("deleteFile : 실패함");
        });
    }
  };

  /** ===== 파일 다운로드 function */
  const downloadFile = async (e, fileNo, fileName) => {
    console.log("============downloadFile");

    e.preventDefault();

    axios({
      method: "get",
      url: `http://localhost:8080/api/file/download?fileNo=${fileNo}`,
      responseType: "blob",
    })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((err) => {
        alert("파일 다운에 실패했습니다.");
        console.log("downloadFile : 실패함");
        console.log(err);
      });
  };

  useEffect(() => {
    //boardNo가 없을경우
    if (!targetBoardNo) {
      alert("잘못된 접근입니다.");
      navigate(-1);
    }

    //디테일 가져오기
    getBoardDetail();

    //let payloadString = Object.entries(searchParams).map(e => e.join('=')).join('&');
  }, []);

  if (!board) {
    return <div>로딩중입니다...</div>;
  } else {
    return (
      <>
        {/* pwd 모달팝업 */}
        <ModalPwd
          open={modalPwdOpen}
          close={closeModal}
          header="비밀번호 확인"
          modalPwdAfterName={modalPwdAfterName}
          pwd={board.password}
          goBoardReg={goBoardReg}
          delBoard={delBoard}
        />

        <table className="write">
          <colgroup>
            <col style={{ width: "150px" }} />
            <col />
            <col style={{ width: "150px" }} />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <th className="fir">작성자</th>
              <td>{board.writerNm}</td>
              <th className="fir">작성일시</th>
              <td>{board.regDt}</td>
            </tr>
            <tr>
              <th className="fir">카테고리</th>
              <td colSpan="3">{board.categoryNm}</td>
            </tr>
            <tr>
              <th className="fir">제목</th>
              <td colSpan="3">{board.title}</td>
            </tr>
            <tr>
              <th className="fir">내용</th>
              <td colSpan="3">
                <pre>{board.cont}</pre>
              </td>
            </tr>
            <tr>
              <th className="fir">첨부파일</th>
              <td colSpan="3">
                {board.fileList.length === 0
                  ? ""
                  : board.fileList.map((file) => (
                      <span key={file.fileNo}>
                        <a
                          href="{() => false}"
                          onClick={(e) =>
                            downloadFile(e, file.fileNo, file.originFileNm)
                          }
                        >
                          {file.originFileNm}
                        </a>
                        <br />
                      </span>
                    ))}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="btn-box r">
          <a
            href="#!"
            className="btn btn-green"
            onClick={(e) => {
              e.preventDefault();
              openModalPwd(e, "reg");
            }}
          >
            수정
          </a>
          <a
            href="#!"
            className="btn btn-red"
            onClick={(e) => {
              e.preventDefault();
              openModalPwd(e, "del");
            }}
          >
            삭제
          </a>
          <a
            href="#!"
            className="btn btn-default"
            onClick={(e) => {
              goBoardList(e);
            }}
          >
            목록
          </a>
        </div>
      </>
    );
  }
}

export default BoardDetailPage;
