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

  /** ===== state로 넘어온 값 */
  const { state } = useLocation();
  const urlParamData = state;

  /** ===== state 지정 */
  let [board, setBoard] = useState({
    writerNm: "",
    password: "",
    categoryCd: "CTG002",
    title: "",
    cont: "",
    listFileFile: [],
  }); //게시글데이터
  let [ctgCodeList, setCtgCodeList] = useState([]);
  let [arrAddFile, setArrAddFile] = useState(null); //추가하는 파일_file 리스트
  let [delFileNo, setArrDelFileSn] = useState([]); //삭제하는 파일EncodeSn 리스트

  /** ===== ref 지정 */
  const inputRef = useRef([]);

  /** ===== mount되면 */
  useEffect(() => {
    if (targetBoardNo) {
      //디테일 가져오기
      getBoardDetail();
    }
  }, []);

  /** ===== 리스트 가는 function */
  const goBoardList = (e) => {
    if (!e && e !== "undefined" && e !== undefined) {
      e.preventDefault();
    }

    navigate(`/`, { state: urlParamData });
  };

  /** ===== board데이터 셋팅 변경 function */
  const settingBoardData = (e) => {
    const { name, value } = e.target;
    setBoard((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  /** ===== 디테일 가져오는 function */
  const getBoardDetail = () => {
    axios({
      method: "get",
      url: `http://localhost:18083/board/${targetBoardNo}`,
    })
      .then((res) => {
        if (res.data.resultCode === 200) {
          //board 셋팅
          setBoard(res.data.data);
        } else {
          //데이터가 올바르지않거나 오류가 있을경우 뒤로가기

          alert(res.data.resultMessage);
          navigate(-1);
        }
      })
      .catch(() => {
        console.log("getBoardDetail : 실패함");
      });
  };

  /** ===== 저장 및 수정 function */
  const saveBoard = async (e) => {
    console.log("============saveBoard");

    if (!e && e !== "undefined" && e !== undefined) {
      e.preventDefault();
    }
    // [[1]]. 유효성 검사
    if (!chkValidation()) {
      return;
    }

    // [[2]]. 데이터 셋팅
    let fd = new FormData();

    /* 2-1. 파일_file */
    if (arrAddFile != null) {
      for (let i = 0; i < arrAddFile.length; i++) {
        fd.append("board_file", arrAddFile[i]);
      }
    }
    /* 2-2. 삭제할 파일 */
    fd.append("arrdelFileNo", delFileNo);

    /* 2-3. board정보 */
    Object.keys(board).forEach((key) => {
      fd.append(key, board[key]); //타입
    });

    if (targetBoardNo) {
      //boardNo
      fd.append("boardNo", targetBoardNo);
    }

    // [[3]]. 저장 및 수정
    await axios
      .post(`http://localhost:8080/api/board/insert`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        if (targetBoardNo) {
          //수정이면
          //디테일로 가기
          setArrAddFile(null);
          navigate(`/list?targetBoardNo=${targetBoardNo}`);
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
    console.log(inputRef.current.length);
    for (let i = 0; i < inputRef.current.length; i++) {
      console.log(inputRef.current[i]);
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
  const downloadFile = async (encodeFileSn) => {
    console.log("============downloadFile");

    const url = `http://localhost:18083/file/downloadFile?encodeFileSn=${encodeFileSn}`;
    const download = document.createElement("a");

    download.href = url;
    download.setAttribute("encodeFileSn", encodeFileSn);
    download.setAttribute("type", "application/json");
    download.click();
  };

  /** ===== 파일 바로 삭제 function */
  const deleteFile = async (encodeFileSn) => {
    console.log("============deleteFile");

    if (window.confirm("삭제 하시겠습니까?")) {
      await axios
        .post(`http://localhost:18083/file/deleteFile`, null, {
          headers: { "content-type": "application/json" },
          params: { encodeFileSn: encodeFileSn },
        })
        .then((res) => {
          if (res.data.resultCode === 200) {
            //화면 재로딩
            window.location.reload();
          } else {
            // 오류가 있을경우

            alert(res.data.resultMessage);
          }
        })
        .catch(() => {
          console.log("deleteFile : 실패함");
        });
    }
  };

  /** ===== 파일 저장시에 삭제 function ( 저장시에 삭제할 파일 셋팅 + 파일 안보이게 하기)  */
  const addDelFileSet = async (e) => {
    console.log("============addDelFileSet");

    let id = e.target.id;
    let arrId = id.split("___");
    let file_list_type = arrId[0]; //file_list_type
    let encodeFileSn = arrId[1]; //암호화된 파일 번호

    // [[1]]. 화면에서 삭제
    // 1-1. 지울 파일 수정해서 넣기
    let tempListFile = board[file_list_type];
    tempListFile = tempListFile.filter(
      (element) => element["encodeFileSn"] !== encodeFileSn
    );
    let tempBoard = { ...board };
    tempBoard[file_list_type] = tempListFile;

    // 1-2. board에 셋팅
    setBoard(tempBoard);

    // [[2]]. 지울 파일 셋팅하기
    delFileNo.push(encodeFileSn);
    setArrDelFileSn(delFileNo);
  };

  /** ===== 파일 LIST에 추가 AAAAAAAAASH*/

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
        if (res.data.size !== 0) {
          setCtgCodeList(res.data);
        }
      })
      .catch((err) => {
        console.log("getCodeList : 실패함");
        console.log(err);
      });
  };

  useEffect(() => {
    getCodeList("CTG");
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
            <tr>
              <th className="fir">
                첨부파일 1 <i className="req">*</i>
              </th>
              <td colSpan="3">
                <span>
                  <a href="#">상담내역1.xlsx</a>
                  <a href="#" className="ic-del">
                    삭제
                  </a>
                </span>
                <br />
                <input type="file" className="input block mt10" />
              </td>
            </tr>
            <tr>
              <th className="fir">첨부파일 2</th>
              <td colSpan="3">
                <span>
                  <a href="#">상담내역2.xlsx</a>
                  <a href="#" className="ic-del">
                    삭제
                  </a>
                </span>
                <br />
                <input type="file" className="input block mt10" />
              </td>
            </tr>
            <tr>
              <th className="fir">첨부파일 3</th>
              <td colSpan="3">
                <input
                  type="file"
                  className="input block mt10"
                  onChange={(e) => setArrAddFile(e.target.files)}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="btn-box r">
          <a
            href="#!"
            onClick={(e) => {
              saveBoard(e);
            }}
            className="btn btn-red"
          >
            {targetBoardNo ? "수정" : "등록"}
          </a>
          <a
            href="#!"
            onClick={(e) => {
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
