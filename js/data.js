/* ==========================================================================
 * Du lieu mau cho trang chu.
 *
 * Ten / dia danh / cap di tich lay theo danh sach cong khai; phan mo ta
 * (desc) de trong se duoc sinh tu dong tu dia danh + cap di tich. Khi co du
 * lieu that, dien desc, img (duong dan anh), sect, rating... vao tung muc.
 *
 *   type  : "Chùa" | "Cổ tự" | "Thiền viện"     (bo loc nhanh)
 *   rank  : "Di tích Quốc gia" | "Di tích QG đặc biệt" | ""
 *   img   : de trong -> dung anh minh hoa trong images/
 * ========================================================================== */
var TEMPLES = [
    { slug: "chua-ba-ngo", name: "Chùa Bà Ngô", area: "Hoa Lư", province: "Tỉnh Ninh Bình", rank: "Di tích QG đặc biệt", type: "Cổ tự", sect: "Bắc tông", featured: true },
    { slug: "chua-bich-dong", name: "Chùa Bích Động", area: "Hoa Lư", province: "Tỉnh Ninh Bình", rank: "Di tích QG đặc biệt", type: "Cổ tự", sect: "Bắc tông" },
    { slug: "chua-bo-da", name: "Chùa Bổ Đà", area: "Vân Hà", province: "Tỉnh Bắc Ninh", rank: "Di tích QG đặc biệt", type: "Cổ tự", sect: "Bắc tông" },
    { slug: "chua-boi-khe", name: "Chùa Bối Khê", area: "Thanh Oai", province: "TP. Hà Nội", rank: "Di tích QG đặc biệt", type: "Cổ tự", sect: "Bắc tông" },
    { slug: "chua-an-long", name: "Chùa An Long", area: "", province: "TP. Đà Nẵng", rank: "Di tích Quốc gia", type: "Chùa", sect: "Phật giáo", featured: true },
    { slug: "chua-ba-le", name: "Chùa Bà Lê", area: "Chợ Mới", province: "Tỉnh An Giang", rank: "Di tích Quốc gia", type: "Chùa", sect: "Phật giáo", featured: true },
    { slug: "chua-bang", name: "Chùa Bằng", area: "Hoàng Mai", province: "TP. Hà Nội", rank: "Di tích Quốc gia", type: "Chùa", sect: "Bắc tông", featured: true },
    { slug: "chua-bao-an", name: "Chùa Báo Ân", area: "Nghi Xuân", province: "Tỉnh Hà Tĩnh", rank: "Di tích Quốc gia", type: "Chùa", sect: "Bắc tông", featured: true },
    { slug: "chua-bao-quang", name: "Chùa Bảo Quang", area: "Ngô Quyền", province: "TP. Hải Phòng", rank: "Di tích Quốc gia", type: "Chùa", sect: "Bắc tông", featured: true },
    { slug: "chua-bao-quang-vb", name: "Chùa Bảo Quang", area: "Vĩnh Bảo", province: "TP. Hải Phòng", rank: "Di tích Quốc gia", type: "Chùa", sect: "Bắc tông" },
    { slug: "chua-bao-quoc", name: "Chùa Báo Quốc", area: "Ân Thi", province: "Tỉnh Hưng Yên", rank: "Di tích Quốc gia", type: "Chùa", sect: "Bắc tông" },
    { slug: "chua-bao-thap", name: "Chùa Bảo Tháp", area: "Thanh Trì", province: "TP. Hà Nội", rank: "Di tích Quốc gia", type: "Chùa", sect: "Bắc tông" },
    { slug: "chua-bung", name: "Chùa Bùng", area: "Thạch Thất", province: "TP. Hà Nội", rank: "Di tích Quốc gia", type: "Cổ tự", sect: "Bắc tông" },
    { slug: "ban-tich-tu", name: "Bản Tịch tự", area: "Văn Lâm", province: "Tỉnh Hưng Yên", rank: "Di tích Quốc gia", type: "Cổ tự", sect: "Bắc tông" },
    { slug: "bao-thap-chua-yen-xa", name: "Bảo Tháp - chùa Yên Xá", area: "Thanh Trì", province: "TP. Hà Nội", rank: "Di tích Quốc gia", type: "Chùa", sect: "Bắc tông" },
    { slug: "chua-den-co-lung", name: "Chùa - Đền Cổ Lũng", area: "Tiên Du", province: "Tỉnh Bắc Ninh", rank: "Di tích Quốc gia", type: "Chùa", sect: "Bắc tông" },
    { slug: "chua-a-nau", name: "Chùa A Nậu (Chùa Sệu)", area: "Hoa Lư", province: "Tỉnh Ninh Bình", rank: "Di tích Quốc gia", type: "Chùa", sect: "Bắc tông" },
    { slug: "chua-am-viet-tri", name: "Chùa Am", area: "Việt Trì", province: "Tỉnh Phú Thọ", rank: "Di tích Quốc gia", type: "Chùa", sect: "Bắc tông" },
    { slug: "chua-am-hoa-lu", name: "Chùa Am", area: "Hoa Lư", province: "Tỉnh Ninh Bình", rank: "Di tích Quốc gia", type: "Chùa", sect: "Bắc tông" },
    { slug: "chua-am-bac-ninh", name: "Chùa Am", area: "", province: "Tỉnh Bắc Ninh", rank: "Di tích Quốc gia", type: "Chùa", sect: "Bắc tông" },
    { slug: "chua-am-dien-quang", name: "Chùa Am - Diên Quang Tự", area: "Đức Thọ", province: "Tỉnh Hà Tĩnh", rank: "Di tích Quốc gia", type: "Cổ tự", sect: "Bắc tông" },
    { slug: "chua-am-cay-de", name: "Chùa Am Cây Đề", area: "Ba Đình", province: "TP. Hà Nội", rank: "Di tích Quốc gia", type: "Chùa", sect: "Bắc tông" },
    { slug: "chua-am-thieu", name: "Chùa Am Thiếu", area: "Hoa Lư", province: "Tỉnh Ninh Bình", rank: "Di tích Quốc gia", type: "Chùa", sect: "Bắc tông" },
    { slug: "chua-am-tien", name: "Chùa Am Tiên", area: "Hoa Lư", province: "Tỉnh Ninh Bình", rank: "Di tích Quốc gia", type: "Cổ tự", sect: "Bắc tông" },
    { slug: "thien-vien-truc-lam-mau", name: "Thiền viện Trúc Lâm (mẫu)", area: "", province: "Tỉnh Lâm Đồng", rank: "", type: "Thiền viện", sect: "Thiền phái Trúc Lâm" },
    { slug: "chua-mau-can-tho", name: "Chùa mẫu Cần Thơ", area: "Ninh Kiều", province: "TP. Cần Thơ", rank: "", type: "Chùa", sect: "Nam tông Khmer" },
];

/* Toa do tam tinh/thanh (gan dung) -> dung cho nut "Chua gan toi".
 * Khi co lat/lng that cua tung chua, them { lat, lng } vao muc chua do. */
var PROVINCE_CENTER = {
    "TP. Hà Nội": [21.028, 105.854],
    "TP. Hải Phòng": [20.845, 106.688],
    "TP. Đà Nẵng": [16.054, 108.202],
    "TP. Cần Thơ": [10.045, 105.746],
    "Tỉnh Ninh Bình": [20.251, 105.975],
    "Tỉnh Bắc Ninh": [21.186, 106.076],
    "Tỉnh Hưng Yên": [20.646, 106.051],
    "Tỉnh Hà Tĩnh": [18.343, 105.906],
    "Tỉnh An Giang": [10.521, 105.126],
    "Tỉnh Phú Thọ": [21.322, 105.402],
    "Tỉnh Lâm Đồng": [11.94, 108.458],
};

/* Ngay le / via theo am lich (thang, ngay) */
var FESTIVALS = [
    { m: 1, d: 1, name: "Tết Nguyên Đán · Vía Phật Di Lặc" },
    { m: 1, d: 15, name: "Rằm tháng Giêng (Thượng nguyên)" },
    { m: 2, d: 8, name: "Vía Phật Thích Ca xuất gia" },
    { m: 2, d: 15, name: "Vía Phật Thích Ca nhập Niết bàn" },
    { m: 2, d: 19, name: "Vía Quán Thế Âm (đản sanh)" },
    { m: 2, d: 21, name: "Vía Bồ Tát Phổ Hiền" },
    { m: 4, d: 4, name: "Vía Bồ Tát Văn Thù" },
    { m: 4, d: 15, name: "Đại lễ Phật Đản" },
    { m: 6, d: 19, name: "Vía Quán Thế Âm (thành đạo)" },
    { m: 7, d: 13, name: "Vía Bồ Tát Đại Thế Chí" },
    { m: 7, d: 15, name: "Lễ Vu Lan báo hiếu" },
    { m: 7, d: 30, name: "Vía Bồ Tát Địa Tạng" },
    { m: 9, d: 19, name: "Vía Quán Thế Âm (xuất gia)" },
    { m: 9, d: 30, name: "Vía Phật Dược Sư" },
    { m: 10, d: 15, name: "Rằm tháng Mười (Hạ nguyên)" },
    { m: 11, d: 17, name: "Vía Phật A Di Đà" },
    { m: 12, d: 8, name: "Vía Phật Thích Ca thành đạo" },
];
