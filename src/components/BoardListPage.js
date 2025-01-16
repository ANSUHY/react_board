import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import imgNew from "../assets/images/new.gif";
import Pagination from "../components/common/Pagination";

function BoardListPage() {
  /** ===== url매칭을 하기 위함 */
  const navigate = useNavigate();

  /** ===== state로 넘어온 값 */
  const location = useLocation();
  let urlParamData = location.state;
  console.log("List : state로 넘어온 값 ", urlParamData);

  /** ===== state 지정 */
  let [ctgCodeList, setCtgCodeList] = useState([]);
  let [boards, setBoards] = useState([]); //게시글데이터들
  let [totCnt, setTotCnt] = useState(0); //검색한 전체 게시글수

  let [rowCount, setRowCount] = useState(
    urlParamData && urlParamData["rowCount"] ? urlParamData["rowCount"] : 10
  ); //한페이지에 나올수
  let [currPage, setCurrPage] = useState(
    urlParamData && urlParamData["currPage"] ? urlParamData["currPage"] : 1
  ); //현재 페이지
  let [searchOrder, setSearchOrder] = useState(
    urlParamData && urlParamData["searchOrder"]
      ? urlParamData["searchOrder"]
      : "order1"
  ); //정렬 순서

  let [searchParamData, setSearchParamData] = useState({
    categoryCd:
      urlParamData && urlParamData["categoryCd"]
        ? urlParamData["categoryCd"]
        : "",
    searchKeyword:
      urlParamData && urlParamData["searchKeyword"]
        ? urlParamData["searchKeyword"]
        : "all",
    searchText:
      urlParamData && urlParamData["searchText"]
        ? urlParamData["searchText"]
        : "",
  }); //검색param
  let [paramData, setParamData] = useState(); //최종param

  /* 변경되었을 경우 set */
  const handleChage = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setSearchParamData((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  /** ===== 리스트 가져오는 function */
  const getBoardList = async (chagePage) => {
    console.log("============getBoardList");

    //검색어 조건 리셋(url에 있는 조건)
    if (location.state != null) {
      await navigate(location.pathname, {});
    }

    //검색 param과 페이징 더해줌
    const param = {
      ...searchParamData,
      rowCount: rowCount,
      currPage: chagePage,
      searchOrder: searchOrder,
    };
    setParamData(param);

    let tempCnt = 0;
    let tempBoards = [];
    await axios({
      method: "get",
      url: `http://localhost:8080/api/board/list?`,
      params: param,
    })
      .then((res) => {
        //총개수 셋팅
        tempCnt = res.data.totalCount;

        //리스트 셋팅
        if (res.data.totalCount === 0) {
          tempBoards = [];
        } else {
          tempBoards = res.data.list;
        }
        setTotCnt(tempCnt);
        setBoards(tempBoards);
      })
      .catch((err) => {
        console.log("getBoardList : 실패함");
        console.log(err);
      });
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

  /** ===== 디테일 가는 function */
  const goBoardDetail = (boardNo, e) => {
    e.preventDefault();
    let param = "targetBoardNo=" + boardNo;
    console.log("List : 넘기는 값", paramData);
    navigate(`/detail?${param}`, { state: paramData });
  };

  /** ===== Reg 가는 function */
  const goBoardReg = (boardNo, e) => {
    e.preventDefault();
    console.log("List : 넘기는 값", paramData);
    navigate(`/reg`, { state: paramData });
  };

  useEffect(() => {
    /* 
    위에서 다 해결함===========
    //검색어 조건 유지(url에 있는 조건)
    Object.keys(searchParamData).forEach((key) => {
      if (urlParamData && urlParamData[key]) {
        setSearchParamData((prevValues) => ({
          ...prevValues,
          [key]: urlParamData[key],
        }));
      }
    }); */

    //공통코드 조회
    getCodeList("CTG");
  }, []);

  useEffect(() => {
    // boardList 가져오기
    getBoardList(currPage);
  }, [currPage, rowCount, searchOrder]);

  return (
    <>
      <div className="hide-dv mt10" id="hideDv">
        <table className="view">
          <colgroup>
            <col style={{ width: "150px" }} />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <th>카테고리</th>
              <td>
                <select
                  className="select"
                  style={{ width: "150px" }}
                  name="categoryCd"
                  onChange={handleChage}
                  value={searchParamData.categoryCd}
                >
                  <option value="">전체</option>
                  {ctgCodeList?.map((code) => (
                    <option key={code.commCd} value={code.commCd}>
                      {code.commCdNm}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <th>검색어</th>
              <td>
                <select
                  className="select"
                  style={{ width: "150px" }}
                  name="searchKeyword"
                  onChange={handleChage}
                  value={searchParamData.searchKeyword}
                >
                  <option value="all">전체</option>
                  <option value="title">제목</option>
                  <option value="cont">내용</option>
                </select>
                <input
                  type="text"
                  className="input"
                  style={{ width: "300px" }}
                  name="searchText"
                  onChange={handleChage}
                  value={searchParamData.searchText}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="btn-box btm l">
        <a
          href="{() => false}"
          className="btn btn-red fr"
          onClick={(e) => {
            e.preventDefault();
            getBoardList(1);
          }}
        >
          검색
        </a>
      </div>

      <div className="tbl-hd noBrd mb0">
        <span className="total">
          검색 결과 : <strong>{totCnt}</strong> 건
        </span>
        <div className="right">
          <span className="spanTitle">정렬 순서 :</span>
          <select
            className="select"
            style={{ width: "120px" }}
            name="searchOrder"
            onChange={(e) => {
              e.preventDefault();
              setSearchOrder(e.target.value);
              setCurrPage(1);
            }}
            value={searchOrder}
          >
            <option value="order1">최근 작성일</option>
            <option value="order2">조회수</option>
          </select>
        </div>
      </div>

      <table className="list default">
        <colgroup>
          <col style={{ width: "60px" }} />
          <col style={{ width: "80px" }} />
          <col />
          <col style={{ width: "80px" }} />
          <col style={{ width: "80px" }} />
          <col style={{ width: "80px" }} />
          <col style={{ width: "120px" }} />
        </colgroup>
        <thead>
          <tr>
            <th>No</th>
            <th>카테고리</th>
            <th>제목</th>
            <th>첨부파일</th>
            <th>작성자</th>
            <th>조회수</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          {totCnt === 0 ? (
            <tr>
              <td colSpan="7" className="no-data">
                데이터가 없습니다
              </td>
            </tr>
          ) : (
            boards.map((board) => (
              <tr
                key={board.boardNo}
                onClick={(e) => {
                  e.preventDefault();
                  goBoardDetail(board.boardNo, e);
                }}
              >
                <td>{board.rowNum}</td>
                <td>{board.categoryNm}</td>
                <td className="l">
                  <a href="{() => false}">
                    {board.title}
                    {board.newYn === "Y" ? (
                      <img src={imgNew} className={"new"} />
                    ) : (
                      ""
                    )}
                  </a>
                </td>
                <td>
                  {board.fileYn === "Y" ? (
                    <a href="{() => false}" className={"ic-file"}>
                      파일
                    </a>
                  ) : (
                    ""
                  )}
                </td>
                <td>{board.writerNm}</td>
                <td>{board.viewCnt}</td>
                <td>{board.regDt}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totCnt === 0 ? (
        ""
      ) : (
        <div className="paginate_complex">
          <Pagination
            totCnt={totCnt}
            currPage={currPage}
            rowCount={rowCount}
            setCurrPage={setCurrPage}
          />

          <div className="right">
            <select
              className="select"
              style={{ width: "120px" }}
              onChange={(e) => {
                e.preventDefault();
                setRowCount(e.target.value);
                setCurrPage(1);
              }}
              value={rowCount}
            >
              <option value="10">10개씩보기</option>
              <option value="30">30개씩보기</option>
            </select>
          </div>
        </div>
      )}

      <div className="btn-box l mt30">
        <a
          href="{() => false}"
          className="btn btn-green fr"
          onClick={(e) => {
            e.preventDefault();
            goBoardReg("", e);
          }}
        >
          등록
        </a>
      </div>
    </>
  );
}

export default BoardListPage;
