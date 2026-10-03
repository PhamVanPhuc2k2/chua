/* ==========================================================================
 * Am lich Viet Nam (mui gio +7)
 *
 * Thuat toan doi lich duong <-> am cua Ho Ngoc Duc (tinh trang thai trang
 * moi va trung khi theo cong thuc thien van). Dung cho the "Am lich hom nay"
 * va danh sach ngay le / via sap toi o trang chu.
 * ========================================================================== */
var Lunar = (function () {
    "use strict";

    var TZ = 7;
    var PI = Math.PI;
    var floor = Math.floor;

    function jdFromDate(dd, mm, yy) {
        var a = floor((14 - mm) / 12);
        var y = yy + 4800 - a;
        var m = mm + 12 * a - 3;
        var jd = dd + floor((153 * m + 2) / 5) + 365 * y + floor(y / 4) - floor(y / 100) + floor(y / 400) - 32045;
        if (jd < 2299161) jd = dd + floor((153 * m + 2) / 5) + 365 * y + floor(y / 4) - 32083;
        return jd;
    }

    function jdToDate(jd) {
        var a, b, c;
        if (jd > 2299160) {
            a = jd + 32044;
            b = floor((4 * a + 3) / 146097);
            c = a - floor((b * 146097) / 4);
        } else {
            b = 0;
            c = jd + 32082;
        }
        var d = floor((4 * c + 3) / 1461);
        var e = c - floor((1461 * d) / 4);
        var m = floor((5 * e + 2) / 153);
        return [e - floor((153 * m + 2) / 5) + 1, m + 3 - 12 * floor(m / 10), b * 100 + d - 4800 + floor(m / 10)];
    }

    function newMoonDay(k) {
        var T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
        var jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
        jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
        var M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
        var Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
        var F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
        var C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
        C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
        C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
        C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
        C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
        C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
        C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
        var deltat = T < -11
            ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
            : -0.000278 + 0.000265 * T + 0.000262 * T2;
        return floor(jd1 + C1 - deltat + 0.5 + TZ / 24);
    }

    function sunLongitude(jdn) {
        var T = (jdn - 2451545.5 - TZ / 24) / 36525, T2 = T * T, dr = PI / 180;
        var M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
        var L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
        var DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
        DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
        var L = (L0 + DL) * dr;
        L -= PI * 2 * floor(L / (PI * 2));
        return floor((L / PI) * 6);
    }

    function lunarMonth11(yy) {
        var off = jdFromDate(31, 12, yy) - 2415021;
        var k = floor(off / 29.530588853);
        var nm = newMoonDay(k);
        if (sunLongitude(nm) >= 9) nm = newMoonDay(k - 1);
        return nm;
    }

    function leapMonthOffset(a11) {
        var k = floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
        var last, i = 1;
        var arc = sunLongitude(newMoonDay(k + i));
        do {
            last = arc;
            i++;
            arc = sunLongitude(newMoonDay(k + i));
        } while (arc !== last && i < 14);
        return i - 1;
    }

    /** Duong -> Am. Tra ve { day, month, year, leap } */
    function toLunar(dd, mm, yy) {
        var dayNumber = jdFromDate(dd, mm, yy);
        var k = floor((dayNumber - 2415021.076998695) / 29.530588853);
        var monthStart = newMoonDay(k + 1);
        if (monthStart > dayNumber) monthStart = newMoonDay(k);

        var a11 = lunarMonth11(yy);
        var b11 = a11;
        var year;
        if (a11 >= monthStart) {
            year = yy;
            a11 = lunarMonth11(yy - 1);
        } else {
            year = yy + 1;
            b11 = lunarMonth11(yy + 1);
        }

        var day = dayNumber - monthStart + 1;
        var diff = floor((monthStart - a11) / 29);
        var leap = false;
        var month = diff + 11;
        if (b11 - a11 > 365) {
            var leapDiff = leapMonthOffset(a11);
            if (diff >= leapDiff) {
                month = diff + 10;
                if (diff === leapDiff) leap = true;
            }
        }
        if (month > 12) month -= 12;
        if (month >= 11 && diff < 4) year -= 1;
        return { day: day, month: month, year: year, leap: leap };
    }

    /** Am -> Duong. Tra ve Date (gio dia phuong, 00:00) hoac null */
    function toSolar(day, month, year, leap) {
        var a11, b11;
        if (month < 11) {
            a11 = lunarMonth11(year - 1);
            b11 = lunarMonth11(year);
        } else {
            a11 = lunarMonth11(year);
            b11 = lunarMonth11(year + 1);
        }
        var k = floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
        var off = month - 11;
        if (off < 0) off += 12;
        if (b11 - a11 > 365) {
            var leapOff = leapMonthOffset(a11);
            var leapMonth = leapOff - 2;
            if (leapMonth < 0) leapMonth += 12;
            if (leap && month !== leapMonth) return null;
            if (leap || off >= leapOff) off += 1;
        }
        var d = jdToDate(newMoonDay(k + off) + day - 1);
        return new Date(d[2], d[1] - 1, d[0]);
    }

    var CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
    var CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
    var MONTHS = ["Giêng", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "Tám", "Chín", "Mười", "Mười Một", "Chạp"];

    function yearName(y) {
        return CAN[(y + 6) % 10] + " " + CHI[(y + 8) % 12];
    }
    function monthName(m) {
        return MONTHS[m - 1];
    }
    /** "Mùng 8" cho 10 ngay dau thang, con lai de so */
    function dayName(d) {
        return d <= 10 ? "Mùng " + d : String(d);
    }

    return {
        toLunar: toLunar,
        toSolar: toSolar,
        yearName: yearName,
        monthName: monthName,
        dayName: dayName,
    };
})();
