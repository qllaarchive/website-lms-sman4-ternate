/* Registry mapel — dipakai scripts/validate.mjs untuk cross-check shell & lsKey.
   Integrasi Google Apps Script diatur melalui panel admin (?gs=), tidak hardcode. */
window.LMS_REGISTRY = [
  { id:"matematika", name:"Matematika", lsKey:"mtklms_x_sman4ternate_v1", file:"mapel/matematika.html", color:"#1f6fe5", emoji:"📐" },
  { id:"fisika",     name:"Fisika",     lsKey:"lms_fisika_x_v1",          file:"mapel/fisika.html", color:"#5f3dc4", emoji:"⚛️" },
  { id:"sejarah",    name:"Sejarah",    lsKey:"lms_sejarah_x_v1",         file:"mapel/sejarah.html", color:"#c92a2a", emoji:"📜" },
  { id:"pendais",    name:"Pendidikan Agama Islam", lsKey:"lms_pai_x_sman4ternate_v1", file:"mapel/pendais.html", color:"#0f766e", emoji:"🕌" }
];
