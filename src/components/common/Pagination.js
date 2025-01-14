import React, { useContext } from "react";

const Pagination = ({ totCnt, currPage, rowCount, setCurrPage }) => {
  console.log("page들어옴");

  //한 화면에 나올 페이지수(1 2 3 4 5 이런거)
  let pageLimit = 5;

  // 페이징 관련 디폴트 값 설정
  if (currPage <= 0) currPage = 1;

  //
  let startPage = parseInt((currPage - 1) / pageLimit) * pageLimit + 1;
  let endPage = startPage + pageLimit - 1;

  // 총 페이지 수 계산
  let totalPage = Math.ceil(parseInt(totCnt) / parseInt(rowCount));

  if (totalPage < endPage) {
    endPage = totalPage;
  }

  // 페이지 범위 만들기
  let arrPage = [];
  for (let i = startPage; i <= endPage; i++) {
    arrPage.push(i);
  }

  return (
    <>
      <div className="paginate_complex">
        {/* 맨처음 페이지 */}
        <a href="#!" className="direction fir" onClick={() => setCurrPage(1)}>
          처음
        </a>
        {/* 이전 페이지 */}
        <a
          href="#!"
          className="direction prev"
          onClick={() => setCurrPage(currPage - 1)}
        >
          이전
        </a>
        {/* pageLimit 맞게 페이지 수 보여줌 */}
        {arrPage.map((page, index) => {
          return page === currPage ? (
            <a key={page} href="#!">
              <strong>{page}</strong>
            </a>
          ) : (
            <a
              key={page}
              href="#!"
              onClick={(e) => {
                e.preventDefault();
                setCurrPage(page);
              }}
            >
              {page}
            </a>
          );
        })}
        {/* 다음 페이지 */}
        <a
          href="#!"
          className="direction next"
          onClick={() =>
            setCurrPage(currPage < totalPage ? currPage + 1 : totalPage)
          }
        >
          다음
        </a>
        {/* 맨 마지막 페이지 */}
        <a
          href="#!"
          className="direction last"
          onClick={() => setCurrPage(totalPage)}
        >
          끝
        </a>
      </div>
    </>
  );
};

export default React.memo(Pagination);
