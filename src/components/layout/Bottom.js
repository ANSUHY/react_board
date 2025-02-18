import React from "react";

function Bottom() {
  return (
    <div id="footer">
      <div className="footer-wrap">
        <ul className="footer-link">
          <li>
            <a href="#">개인정보처리방침</a>
          </li>
          <li>
            <a href="#">이메일 무단수집거부</a>
          </li>
        </ul>
        <address>
          <b>(주)안수현회사</b> 안수현회사
          <br />
        </address>
        <p className="copy">
          Copyright(C) 2024 by interplug. All Rights Reserved.
        </p>
        <div className="famliy-link">
          <button>관련 사이트 안내</button>
          <ul>
            <li>
              <a href="#">네이버</a>
            </li>
            <li>
              <a href="#">다음</a>
            </li>
            <li>
              <a href="#">구글</a>
            </li>
            <li>
              <a href="#">유투브</a>
            </li>
            <li>
              <a href="#">구글</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Bottom;
