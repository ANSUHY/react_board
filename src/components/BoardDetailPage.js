import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import imgNew from "../assets/images/new.gif";
import Pagination from "../components/common/Pagination";

/** Context지정 */
export const BoardListAshContext = createContext(null);

function BoardDetailPage() {
  /** ===== url매칭을 하기 위함 */
  const navigate = useNavigate();

  /** ===== 파라미터로 넘어온 값 */
  const [searchParams] = useSearchParams();
  let targetBoardNo = searchParams.get("targetBoardNo");

  /** ===== state로 넘어온 값 */
  const { state } = useLocation();
  const urlParamData = state;

  /** ===== state 지정 */
  let [board, setBoard] = useState(); //게시글데이터

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

  /** ===== 디테일 가져오는 function */
  const getBoardDetail = () => {
    console.log("============getBoardDetail", targetBoardNo);

    axios({
      method: "get",
      url: `http://localhost:8080/api/board/detail/${targetBoardNo}`,
    })
      .then((res) => {
        console.log(res.data);
        //board 셋팅
        setBoard(res.data);
      })
      .catch((err) => {
        console.log("getBoardDetail : 실패함");
        console.log(err);
      });
  };

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
              <td colSpan="3">{board.cont}</td>
            </tr>
            <tr>
              <th className="fir">첨부파일</th>
              <td colSpan="3">
                <span>
                  <a href="#">상담내역1.xlsx</a>
                </span>
                <br />
                <span>
                  <a href="#">상담내역2.xlsx</a>
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="btn-box r">
          <a href="#" className="btn btn-green">
            수정
          </a>
          <a href="#" className="btn btn-red">
            삭제
          </a>
          <a href="#" className="btn btn-default">
            목록
          </a>
        </div>
      </>
    );
  }
}

export default BoardDetailPage;
