/* ==========================================================================
 * Chua Viet - JS thuan, khong phu thuoc thu vien.
 *
 *   Chung      : menu may nho, lien ket "sap ra mat", thong bao (toast)
 *   Trang chu  : am lich hom nay, di tich tieu bieu, danh ba + bo loc
 *   Trang chua : thanh rut gon, chia se, thuat ngu, lightbox, bao cao
 *
 * Moi khoi tu kiem tra phan tu cua minh, nen dung chung mot file cho ca
 * hai trang. Trang chu can them js/lunar.js + js/data.js nap truoc.
 * ========================================================================== */
(function () {
    "use strict";

    var PAGE_SIZE = 12;

    var ICON_PIN =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';

    function $(sel, root) {
        return (root || document).querySelector(sel);
    }
    function $$(sel, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(sel));
    }
    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }
    // Bo dau tieng Viet de tim "chua ba ngo" van ra "Chùa Bà Ngô"
    function fold(s) {
        return String(s)
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase();
    }
    function pad(n) {
        return n < 10 ? "0" + n : String(n);
    }

    /* ------------------------------------------------------------------ *
     * Thong bao nho
     * ------------------------------------------------------------------ */
    var toastTimer;
    function toast(msg) {
        var el = $(".toast");
        if (!el) {
            el = document.createElement("div");
            el.className = "toast";
            el.setAttribute("role", "status");
            el.setAttribute("aria-live", "polite");
            document.body.appendChild(el);
        }
        el.textContent = msg;
        // ep reflow de hieu ung chay lai khi goi lien tiep
        void el.offsetWidth;
        el.classList.add("is-show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            el.classList.remove("is-show");
        }, 2800);
    }

    /* ------------------------------------------------------------------ *
     * Chung
     * ------------------------------------------------------------------ */
    function initMenu() {
        var toggle = $(".js-menu-toggle");
        var menu = $(".js-mobile-menu");
        if (!toggle || !menu) return;

        function close() {
            menu.hidden = true;
            toggle.setAttribute("aria-expanded", "false");
        }
        toggle.addEventListener("click", function (e) {
            e.stopPropagation();
            var open = menu.hidden;
            menu.hidden = !open;
            toggle.setAttribute("aria-expanded", String(open));
        });
        document.addEventListener("click", function (e) {
            if (!menu.hidden && !menu.contains(e.target)) close();
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") close();
        });
    }

    // Cac trang chua co (lich, tin tuc, dang nhap...) -> bao sap ra mat
    function initSoonLinks() {
        document.addEventListener("click", function (e) {
            var a = e.target.closest("[data-soon]");
            if (!a) return;
            e.preventDefault();
            toast(a.getAttribute("data-soon") || "Tính năng đang được hoàn thiện — sắp ra mắt.");
        });
    }

    function initYear() {
        $$(".js-year").forEach(function (el) {
            el.textContent = new Date().getFullYear();
        });
    }

    /* ------------------------------------------------------------------ *
     * Trang chu: am lich hom nay + ngay le sap toi
     * ------------------------------------------------------------------ */
    var WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

    // Ngay am -> duong; thang thieu khong co ngay 30 thi le roi vao ngay 29
    function festivalDate(f, lunarYear) {
        var date = Lunar.toSolar(f.d, f.m, lunarYear, false);
        if (!date) return null;
        var back = Lunar.toLunar(date.getDate(), date.getMonth() + 1, date.getFullYear());
        if (back.month !== f.m) date = Lunar.toSolar(f.d - 1, f.m, lunarYear, false);
        return date;
    }

    function initLunar() {
        var box = $(".js-lunar");
        if (!box || typeof Lunar === "undefined") return;

        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var l = Lunar.toLunar(today.getDate(), today.getMonth() + 1, today.getFullYear());

        $(".js-lunar-day", box).textContent = l.day;
        $(".js-lunar-meta", box).innerHTML =
            "tháng " + Lunar.monthName(l.month) + (l.leap ? " nhuận" : "") + " ÂL<br>" +
            WEEKDAYS[today.getDay()] + ", " + pad(today.getDate()) + "/" + pad(today.getMonth() + 1) + "/" + today.getFullYear() + " DL";
        $(".js-lunar-year", box).textContent = "Năm " + Lunar.yearName(l.year) + " · âm lịch Việt Nam";

        var list = $(".js-lunar-list", box);
        if (!list || typeof FESTIVALS === "undefined") return;

        var upcoming = [];
        FESTIVALS.forEach(function (f) {
            for (var y = l.year; y <= l.year + 1; y++) {
                var date = festivalDate(f, y);
                if (date && date >= today) {
                    upcoming.push({ f: f, date: date });
                    break;
                }
            }
        });
        upcoming.sort(function (a, b) {
            return a.date - b.date;
        });

        list.innerHTML = upcoming
            .slice(0, 4)
            .map(function (it) {
                var days = Math.round((it.date - today) / 864e5);
                return (
                    '<li><span class="lunar__chip"><b>' + it.date.getDate() + "</b><small>th" + (it.date.getMonth() + 1) + "</small></span>" +
                    '<div class="lunar__info"><strong>' + esc(it.f.name) + "</strong>" +
                    "<span>" + Lunar.dayName(it.f.d) + " tháng " + Lunar.monthName(it.f.m) + " · " +
                    (days === 0 ? "hôm nay" : "còn " + days + " ngày") + "</span></div></li>"
                );
            })
            .join("");
    }

    /* ------------------------------------------------------------------ *
     * Trang chu: the chua
     * ------------------------------------------------------------------ */
    var RANK_FULL = { "Di tích QG đặc biệt": "Di tích Quốc gia đặc biệt" };

    function place(t) {
        return t.area ? t.area + ", " + t.province : t.province;
    }
    function detailUrl(t) {
        return "chua.html?slug=" + encodeURIComponent(t.slug);
    }
    function imageOf(t) {
        var i = t._i != null ? t._i : TEMPLES.indexOf(t);
        return t.img || "images/temple-" + ((i % 3) + 1) + ".svg";
    }
    function descOf(t) {
        if (t.desc) return t.desc;
        var kind = t.type === "Thiền viện" ? "Thiền viện" : t.type === "Cổ tự" ? "Ngôi cổ tự" : "Ngôi chùa";
        var rank = t.rank ? ", được xếp hạng " + (RANK_FULL[t.rank] || t.rank) : "";
        return kind + " tại " + place(t) + rank + ". Hồ sơ đang được bổ sung lịch sử, kiến trúc, giờ hành lễ và hình ảnh.";
    }
    function badgeHTML(t, extra) {
        return t.rank ? '<span class="badge' + (extra || "") + '">✦ ' + esc(t.rank) + "</span>" : "";
    }

    function featureCard(t) {
        return (
            '<a class="feature-card" href="' + detailUrl(t) + '">' +
            '<img class="img-cover" src="' + esc(imageOf(t)) + '" alt="' + esc(t.name) + '" loading="lazy" decoding="async">' +
            '<span class="feature-card__shade"></span>' +
            badgeHTML(t, " badge--lg") +
            '<div class="feature-card__body"><h3>' + esc(t.name) + "</h3>" +
            '<p class="loc">' + ICON_PIN + " " + esc(place(t)) + "</p></div></a>"
        );
    }

    function templeCard(t, i) {
        var dist = isFinite(t._dist) ? '<span class="temple-card__dist">~' + Math.round(t._dist) + " km</span>" : "";
        return (
            '<a class="temple-card rise" style="animation-delay:' + Math.min(i % PAGE_SIZE, 8) * 40 + 'ms" href="' + detailUrl(t) + '">' +
            '<div class="temple-card__media">' +
            '<img class="img-cover" src="' + esc(imageOf(t)) + '" alt="' + esc(t.name) + '" loading="lazy" decoding="async">' +
            badgeHTML(t) + "</div>" +
            '<div class="temple-card__body"><h3>' + esc(t.name) + "</h3>" +
            '<p class="loc">' + ICON_PIN + " " + esc(place(t)) + dist + "</p>" +
            '<p class="temple-card__desc">' + esc(descOf(t)) + "</p>" +
            '<span class="temple-card__more">Xem hồ sơ chùa →</span></div></a>'
        );
    }

    function initFeatured() {
        var grid = $(".js-featured");
        if (!grid || typeof TEMPLES === "undefined") return;
        grid.innerHTML = TEMPLES.filter(function (t) {
            return t.featured;
        })
            .slice(0, 6)
            .map(featureCard)
            .join("");
    }

    /* ------------------------------------------------------------------ *
     * Trang chu: danh ba + tim kiem + bo loc + xem them
     * ------------------------------------------------------------------ */
    function shortProvince(p) {
        return p.replace(/^(Tỉnh|TP\.)\s*/, "");
    }
    function rankScore(t) {
        return t.rank === "Di tích QG đặc biệt" ? 2 : t.rank ? 1 : 0;
    }
    function haversine(a, b) {
        var r = Math.PI / 180;
        var dLat = (b[0] - a[0]) * r;
        var dLng = (b[1] - a[1]) * r;
        var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    }

    function initDirectory() {
        var root = $(".js-directory");
        if (!root || typeof TEMPLES === "undefined") return;

        var grid = $(".js-dir-grid", root);
        var countEl = $(".js-dir-count", root);
        var empty = $(".js-dir-empty", root);
        var more = $(".js-more", root);
        var moreBtn = $(".js-more-btn", root);
        var moreInfo = $(".js-more-info", root);
        var search = $(".js-search", root);
        var provSel = $(".js-province", root);
        var sectSel = $(".js-sect", root);
        var sortSel = $(".js-sort", root);
        var nearBtn = $(".js-near", root);

        var state = { q: "", type: "all", province: "all", sect: "all", sort: "default", shown: PAGE_SIZE, origin: null };

        var list = TEMPLES.map(function (t, i) {
            var o = Object.assign({}, t);
            o._i = i;
            o._text = fold([t.name, t.area, t.province, t.type, t.sect, t.rank, t.desc || ""].join(" "));
            return o;
        });

        // Dung danh sach tinh / he phai tu du lieu
        var provinces = Array.from(new Set(list.map(function (t) { return t.province; }))).sort(function (a, b) {
            return shortProvince(a).localeCompare(shortProvince(b), "vi");
        });
        provSel.innerHTML =
            '<option value="all">Mọi tỉnh thành (' + provinces.length + ")</option>" +
            provinces.map(function (p) {
                return '<option value="' + esc(p) + '">' + esc(shortProvince(p)) + "</option>";
            }).join("");

        var sects = Array.from(new Set(list.map(function (t) { return t.sect; }).filter(Boolean))).sort(function (a, b) {
            return a.localeCompare(b, "vi");
        });
        sectSel.innerHTML =
            '<option value="all">Mọi hệ phái</option>' +
            sects.map(function (s) {
                return '<option value="' + esc(s) + '">' + esc(s) + "</option>";
            }).join("");

        // So lieu tren hero
        $$(".js-stat-count").forEach(function (el) { el.textContent = list.length; });
        $$(".js-stat-provinces").forEach(function (el) { el.textContent = provinces.length; });

        function coordsOf(t) {
            if (t.lat != null && t.lng != null) return [t.lat, t.lng];
            return (typeof PROVINCE_CENTER !== "undefined" && PROVINCE_CENTER[t.province]) || null;
        }

        function filtered() {
            var words = fold(state.q.trim()).split(/\s+/).filter(Boolean);
            var out = list.filter(function (t) {
                if (words.length && !words.every(function (w) { return t._text.indexOf(w) !== -1; })) return false;
                if (state.type === "relic" && !t.rank) return false;
                if (state.type !== "all" && state.type !== "relic" && t.type !== state.type) return false;
                if (state.province !== "all" && t.province !== state.province) return false;
                if (state.sect !== "all" && t.sect !== state.sect) return false;
                return true;
            });

            if (state.origin) {
                out.forEach(function (t) {
                    var c = coordsOf(t);
                    t._dist = c ? haversine(state.origin, c) : Infinity;
                });
                out.sort(function (a, b) { return a._dist - b._dist; });
            } else {
                out.forEach(function (t) { t._dist = undefined; });
                out.sort(function (a, b) {
                    if (state.sort === "name") return a.name.localeCompare(b.name, "vi");
                    if (state.sort === "rating") return (b.rating || 0) - (a.rating || 0) || a.name.localeCompare(b.name, "vi");
                    return rankScore(b) - rankScore(a) || a._i - b._i;
                });
            }
            return out;
        }

        function render() {
            var items = filtered();
            var visible = items.slice(0, state.shown);

            grid.innerHTML = visible.map(templeCard).join("");

            countEl.textContent = items.length + " / " + list.length + " chùa";
            empty.hidden = items.length > 0;

            var rest = items.length - visible.length;
            more.hidden = rest <= 0;
            if (rest > 0) {
                moreBtn.textContent = "Xem thêm " + Math.min(rest, PAGE_SIZE) + " ngôi chùa";
                moreInfo.textContent = "Đang xem " + visible.length + " / " + items.length;
            }
        }

        function update(patch) {
            Object.assign(state, patch, { shown: PAGE_SIZE });
            render();
        }

        var typing;
        search.addEventListener("input", function () {
            clearTimeout(typing);
            typing = setTimeout(function () {
                update({ q: search.value });
            }, 150);
        });

        $$(".js-chip", root).forEach(function (chip) {
            chip.addEventListener("click", function () {
                $$(".js-chip", root).forEach(function (c) {
                    c.classList.toggle("is-active", c === chip);
                    c.setAttribute("aria-pressed", String(c === chip));
                });
                update({ type: chip.getAttribute("data-type") });
            });
        });

        provSel.addEventListener("change", function () { update({ province: provSel.value }); });
        sectSel.addEventListener("change", function () { update({ sect: sectSel.value }); });
        sortSel.addEventListener("change", function () {
            // Chon cach sap xep khac thi bo sap theo khoang cach
            nearBtn.classList.remove("is-active");
            update({ sort: sortSel.value, origin: null });
        });

        moreBtn.addEventListener("click", function () {
            state.shown += PAGE_SIZE;
            render();
        });

        nearBtn.addEventListener("click", function () {
            if (state.origin) {
                nearBtn.classList.remove("is-active");
                update({ origin: null });
                return;
            }
            if (!navigator.geolocation) {
                toast("Trình duyệt không hỗ trợ định vị.");
                return;
            }
            nearBtn.classList.add("is-loading");
            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    nearBtn.classList.remove("is-loading");
                    nearBtn.classList.add("is-active");
                    update({ origin: [pos.coords.latitude, pos.coords.longitude] });
                    toast("Đã sắp xếp theo khoảng cách gần bạn nhất.");
                },
                function (err) {
                    nearBtn.classList.remove("is-loading");
                    toast(err.code === 1 ? "Bạn chưa cho phép truy cập vị trí." : "Không lấy được vị trí, vui lòng thử lại.");
                },
                { timeout: 10000, maximumAge: 600000 }
            );
        });

        render();
    }

    /* ------------------------------------------------------------------ *
     * Trang chua: thanh rut gon khi cuon qua hero
     * ------------------------------------------------------------------ */
    function initQuickbar() {
        var bar = $(".js-quickbar");
        var hero = $(".js-temple-hero");
        if (!bar || !hero || !("IntersectionObserver" in window)) return;

        new IntersectionObserver(function (entries) {
            var e = entries[0];
            var show = !e.isIntersecting && e.boundingClientRect.top < 0;
            bar.classList.toggle("is-visible", show);
            bar.setAttribute("aria-hidden", String(!show));
        }).observe(hero);
    }

    /* ------------------------------------------------------------------ *
     * Trang chua: chia se
     * ------------------------------------------------------------------ */
    function initShare() {
        $$(".js-share").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var data = { title: document.title, url: location.href };
                if (navigator.share) {
                    navigator.share(data).catch(function () {});
                    return;
                }
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(data.url).then(
                        function () { toast("Đã sao chép liên kết trang."); },
                        function () { toast("Không sao chép được, hãy sao chép địa chỉ trên trình duyệt."); }
                    );
                } else {
                    toast("Hãy sao chép địa chỉ trên thanh trình duyệt để chia sẻ.");
                }
            });
        });
    }

    /* ------------------------------------------------------------------ *
     * Trang chua: thuat ngu nha Phat (bam vao chu gach cham)
     * ------------------------------------------------------------------ */
    function initTerms() {
        var terms = $$(".term[data-def]");
        if (!terms.length) return;

        var pop = document.createElement("div");
        pop.className = "term-pop";
        pop.setAttribute("role", "tooltip");
        pop.id = "term-pop";
        pop.hidden = true;
        document.body.appendChild(pop);
        var current = null;

        function close() {
            if (current) current.setAttribute("aria-expanded", "false");
            current = null;
            pop.hidden = true;
        }
        function open(btn) {
            close();
            current = btn;
            btn.setAttribute("aria-expanded", "true");
            pop.innerHTML = "<b>" + esc(btn.textContent) + "</b>" + esc(btn.getAttribute("data-def"));
            pop.hidden = false;

            var r = btn.getBoundingClientRect();
            var w = pop.offsetWidth;
            var left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), document.documentElement.clientWidth - w - 8);
            var top = r.bottom + 8;
            if (top + pop.offsetHeight > window.innerHeight - 8) top = r.top - pop.offsetHeight - 8;
            pop.style.left = left + window.scrollX + "px";
            pop.style.top = top + window.scrollY + "px";
        }

        terms.forEach(function (btn) {
            btn.setAttribute("aria-expanded", "false");
            btn.setAttribute("aria-describedby", "term-pop");
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                if (current === btn) close();
                else open(btn);
            });
        });
        document.addEventListener("click", function (e) {
            if (current && !pop.contains(e.target)) close();
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") close();
        });
        window.addEventListener("resize", close);
    }

    /* ------------------------------------------------------------------ *
     * Trang chua: thu vien anh phong to
     * ------------------------------------------------------------------ */
    function initLightbox() {
        var figures = $$(".js-gallery figure");
        if (!figures.length) return;

        var box = document.createElement("div");
        box.className = "lightbox";
        box.hidden = true;
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-modal", "true");
        box.setAttribute("aria-label", "Xem ảnh");
        box.innerHTML =
            '<img alt=""><figcaption></figcaption>' +
            '<button type="button" class="lightbox__close" aria-label="Đóng"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
            '<button type="button" class="lightbox__prev" aria-label="Ảnh trước"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button>' +
            '<button type="button" class="lightbox__next" aria-label="Ảnh sau"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>';
        document.body.appendChild(box);

        var img = $("img", box);
        var cap = $("figcaption", box);
        var index = 0;
        var lastFocus = null;

        function show(i) {
            index = (i + figures.length) % figures.length;
            var src = figures[index].querySelector("img");
            img.src = figures[index].getAttribute("data-full") || src.src;
            img.alt = src.alt;
            cap.textContent = src.alt + " · " + (index + 1) + "/" + figures.length;
        }
        function open(i) {
            lastFocus = document.activeElement;
            show(i);
            box.hidden = false;
            document.body.classList.add("no-scroll");
            $(".lightbox__close", box).focus();
        }
        function close() {
            box.hidden = true;
            document.body.classList.remove("no-scroll");
            if (lastFocus) lastFocus.focus();
        }

        figures.forEach(function (fig, i) {
            fig.tabIndex = 0;
            fig.setAttribute("role", "button");
            fig.addEventListener("click", function () { open(i); });
            fig.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open(i);
                }
            });
        });

        var multi = figures.length > 1;
        $(".lightbox__prev", box).hidden = !multi;
        $(".lightbox__next", box).hidden = !multi;
        $(".lightbox__close", box).addEventListener("click", close);
        $(".lightbox__prev", box).addEventListener("click", function () { show(index - 1); });
        $(".lightbox__next", box).addEventListener("click", function () { show(index + 1); });
        box.addEventListener("click", function (e) {
            if (e.target === box) close();
        });
        document.addEventListener("keydown", function (e) {
            if (box.hidden) return;
            if (e.key === "Escape") close();
            else if (e.key === "ArrowLeft" && multi) show(index - 1);
            else if (e.key === "ArrowRight" && multi) show(index + 1);
        });
    }

    /* ------------------------------------------------------------------ *
     * Trang chua: hop thoai bao cao noi dung
     *
     * Chua noi voi noi nhan nao. Khi co endpoint, dat vao data-endpoint
     * cua <form> va gui bang fetch() trong khoi duoi.
     * ------------------------------------------------------------------ */
    function initReport() {
        var dialog = $(".js-report-dialog");
        var opener = $(".js-report");
        if (!dialog || !opener || typeof dialog.showModal !== "function") return;

        var form = $("form", dialog);
        opener.addEventListener("click", function () {
            dialog.showModal();
        });
        dialog.addEventListener("close", function () {
            if (dialog.returnValue !== "send") return;
            var endpoint = form.getAttribute("data-endpoint");
            if (!endpoint) {
                toast("Bản giao diện tĩnh: chưa kết nối nơi nhận báo cáo.");
            } else {
                fetch(endpoint, { method: "POST", body: new FormData(form) }).then(
                    function (r) { toast(r.ok ? "Đã gửi báo cáo. Xin cảm ơn quý vị!" : "Gửi không thành công, vui lòng thử lại."); },
                    function () { toast("Gửi không thành công, vui lòng thử lại."); }
                );
            }
            form.reset();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initSoonLinks();
        initYear();
        initLunar();
        initFeatured();
        initDirectory();
        initQuickbar();
        initShare();
        initTerms();
        initLightbox();
        initReport();
    });
})();
