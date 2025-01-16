import axios from "axios";
import { createContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import imgNew from "../assets/images/new.gif";
import Pagination from "./common/Pagination";

/** Context지정 */
export const BoardListAshContext = createContext(null);

function BoardRegPage() {
  /** ===== url매칭을 하기 위함 */
  const navigate = useNavigate();

  /** ===== 파라미터로 넘어온 값 */
  const [searchParams] = useSearchParams();
  let targetBoardNo = searchParams.get("targetBoardNo");

  /** ===== state로 넘어온 값 AAAAAAAAAASH이거 useEffect[]에 넣어보기*/
  const { state } = useLocation();
  const urlParamData = state;
  console.log("Reg : state로 넘어온 값 ", urlParamData);

  /** ===== state 지정 */
  let [board, setBoard] = useState({
    writerNm: "",
    password: "",
    categoryCd: "CTG001",
    title: "",
    cont: "",
    fileList: [],
  }); //게시글데이터
  let [ctgCodeList, setCtgCodeList] = useState([]);
  let [arrAddFile, setArrAddFile] = useState([null, null, null]); //추가하는 파일_file 리스트

  let fileReqCnt = 3;

  /** ===== ref 지정 */
  const inputRef = useRef([]);

  /** ===== 리스트 가는 function */
  const goBoardList = (e) => {
    e.preventDefault();
    navigate(`/`, { state: urlParamData });
  };

  /** ===== board데이터 변경 function */
  const settingBoardData = (e) => {
    const { name, value } = e.target;
    setBoard((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
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

  /** ===== 저장 및 수정 function */
  const saveBoard = async (e) => {
    console.log("============saveBoard");

    e.preventDefault();

    // [[1]]. 유효성 검사
    if (!chkValidation()) {
      return;
    }

    // [[2]]. 데이터 셋팅
    let fd = new FormData();

    /* 2-1. 파일_file (추가할 파일 셋팅 + 삭제할 파일No 셋팅)*/
    let arrDelFileNo = [];
    if (arrAddFile != null) {
      for (let i = 0; i < arrAddFile.length; i++) {
        if (arrAddFile[i]) {
          // 추가할 파일 셋팅
          fd.append("boardFile", arrAddFile[i]);
          // 삭제할 파일 no 셋팅
          if (board.fileList.length > i && board.fileList[i]) {
            arrDelFileNo.push(board.fileList[i].fileNo);
          }
        }
      }
    }
    fd.append("delFileList", arrDelFileNo);

    /* 2-2. board정보 */
    Object.keys(board).forEach((key) => {
      fd.append(key, board[key]); //타입
    });

    let url = "";
    let method = "";

    if (targetBoardNo) {
      /* 수정 */
      fd.append("boardNo", targetBoardNo);
      url = `http://localhost:8080/api/board/update`;
      method = "put";
    } else {
      /* 새로운것 */
      url = `http://localhost:8080/api/board/insert`;
      method = "post";
    }

    // [[3]]. 저장 및 수정
    await axios({
      method: method,
      url: url,
      data: fd,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        if (targetBoardNo) {
          //수정이면
          //디테일로 가기
          setArrAddFile(null);
          navigate(`/detail?targetBoardNo=${targetBoardNo}`);
        } else {
          //등록이면
          //리스트로 가기
          navigate(`/`);
        }
      })
      .catch(() => {
        console.log("deleteFile : 실패함");
      });
  };

  /** ===== 유효성 검사 function */
  const chkValidation = () => {
    let isValid = true;

    for (let i = 0; i < inputRef.current.length; i++) {
      if (inputRef.current[i].value === "") {
        alert(inputRef.current[i].name + "는(은) 필수 입력사항입니다.");
        inputRef.current[i].focus();
        isValid = false;
        break;
      }
    }

    return isValid;
  };

  /** ===== 파일 다운로드 function */
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

  /** ===== 파일 바로 삭제 function */
  const deleteFile = async (e, fileNo) => {
    console.log("============deleteFile");

    e.preventDefault();

    let listDelFileNo = [];
    listDelFileNo.push(fileNo);

    if (window.confirm("삭제 하시겠습니까?")) {
      await axios
        .delete(`http://localhost:8080/api/file/delete/${listDelFileNo}`, {
          headers: { "content-type": "application/json" },
        })
        .then((res) => {
          //화면 재로딩
          window.location.reload();
        })
        .catch(() => {
          console.log("deleteFile : 실패함");
        });
    }
  };

  /** ===== 파일 변경 function */
  const settingFileData = (seqNo, e) => {
    e.preventDefault();

    const tempArrFile = arrAddFile.map((file, i) => {
      if (i === seqNo) {
        return e.target.files[0];
      } else {
        return file;
      }
    });

    setArrAddFile(tempArrFile);
  };

  /** ===== 공통코드 가져오는 function */
  let getCodeList = async (grpCd) => {
    console.log("============getCodeList");

    //검색 param과 페이징 더해줌
    const param = { grpCd: grpCd };

    await axios({
      method: "get",
      url: `http://localhost:8080/api/comm/code/list?`,
      params: param,
    })
      .then((res) => {
        if (res.data.length !== 0) {
          setCtgCodeList(res.data);
        }
      })
      .catch((err) => {
        console.log("getCodeList : 실패함");
        console.log(err);
      });
  };

  /** ===== [jsx반환] : file부분 */
  const jsxFile = () => {
    const result = [];
    for (let idx = 0; idx < fileReqCnt; idx++) {
      result.push(
        <tr key={idx}>
          <th className="fir">
            첨부파일 {idx + 1} {idx === 0 ? <i className="req">*</i> : ""}
          </th>
          <td colSpan="3">
            {/* AAAAAAAAAAAAAAAAAAAAAASH 여기서 나는 board.fileList[idx] 인것만 사용하면 되는데.. */}
            {board.fileList.map((file, fileIdx) =>
              fileIdx === idx ? (
                <span key={file.fileNo}>
                  <a
                    href="{() => false}"
                    onClick={(e) =>
                      downloadFile(e, file.fileNo, file.originFileNm)
                    }
                  >
                    {file.originFileNm}
                  </a>
                  <a
                    href="{() => false}"
                    onClick={(e) => deleteFile(e, file.fileNo)}
                    className="ic-del"
                  >
                    삭제
                  </a>
                  <br />
                </span>
              ) : (
                ""
              )
            )}
            <input
              type="file"
              className="input block mt10"
              onChange={(e) => {
                settingFileData(idx, e);
              }}
            />
          </td>
        </tr>
      );
    }

    return result;
  };

  useEffect(() => {
    getCodeList("CTG");

    if (targetBoardNo) {
      //디테일 가져오기
      getBoardDetail();
    }
  }, []);

  if (!board) {
    return <div>로딩중입니다...</div>;
  } else {
    return (
      <>
        <table className="write">
          <colgroup>
            <col style={{ width: "150px" }} />
            <col />
            <col style={{ width: "150px" }} />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <th className="fir">
                작성자 <i className="req">*</i>
              </th>
              <td>
                <input
                  type="text"
                  className="input block"
                  name="writerNm"
                  value={board.writerNm}
                  onChange={(e) => settingBoardData(e)}
                  ref={(el) => (inputRef.current[0] = el)}
                />
              </td>
              <th className="fir">
                비밀번호 <i className="req">*</i>
              </th>
              <td>
                <input
                  type="password"
                  className="input block"
                  name="password"
                  value={board.password}
                  onChange={(e) => settingBoardData(e)}
                  ref={(el) => (inputRef.current[1] = el)}
                />
              </td>
            </tr>
            <tr>
              <th className="fir">
                카테고리 <i className="req">*</i>
              </th>
              <td colSpan="3">
                <select
                  className="select"
                  style={{ width: "150px" }}
                  name="categoryCd"
                  value={board.categoryCd}
                  onChange={(e) => settingBoardData(e)}
                  ref={(el) => (inputRef.current[2] = el)}
                >
                  {ctgCodeList?.map((code) => (
                    <option key={code.commCd} value={code.commCd}>
                      {code.commCdNm}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <th className="fir">
                제목 <i className="req">*</i>
              </th>
              <td colSpan="3">
                <input
                  type="text"
                  className="input"
                  style={{ width: "100%" }}
                  name="title"
                  value={board.title}
                  onChange={(e) => settingBoardData(e)}
                  ref={(el) => (inputRef.current[3] = el)}
                />
              </td>
            </tr>
            <tr>
              <th className="fir">
                내용 <i className="req">*</i>
              </th>
              <td colSpan="3">
                <textarea
                  style={{ width: "100%", height: "300px" }}
                  name="cont"
                  value={board.cont}
                  onChange={(e) => settingBoardData(e)}
                  ref={(el) => (inputRef.current[4] = el)}
                />
              </td>
            </tr>
            {jsxFile()}
          </tbody>
        </table>

        <div className="btn-box r">
          <a
            href="{() => false}"
            onClick={(e) => {
              saveBoard(e);
            }}
            className="btn btn-red"
          >
            {targetBoardNo ? "수정" : "등록"}
          </a>
          <a
            href="{() => false}"
            onClick={(e) => {
              e.preventDefault();
              goBoardList(e);
            }}
            className="btn btn-default"
          >
            취소
          </a>
        </div>
      </>
    );
  }
}

export default BoardRegPage;
