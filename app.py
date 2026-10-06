from flask import Flask, render_template, request, jsonify, session
import json
import os

app = Flask(__name__)
app.secret_key = "ganti-dengan-secret-key-acak-anda"

# ==== KONFIGURASI ====
PASSWORD = "2108"
PASSWORD_CLUE = "Tanggal & bulan ulang tahun kamu"
RECIPIENT_NAME = "Sayang"

LETTER_TITLE = "Untuk Kamu"
LETTER_SUBTITLE = "Favorit Aku"
LETTER_BODY = (
    "Hatiku begitu penuh dengan kamu, aku bahkan tak lagi menganggapnya milikku. "
    "Aku persembahkan hatiku yang bersimbah darah untuk kamu, Sayangku."
    "Tak layak lagi aku memilikinya,"
    "tak lagi mau ia berdetak tanpa mengoyak indah ranummu. "
    "Meretak ia jika sehari saja tak menyesap candu senyummu. "
    "Tak lagi mau ia merajut nadi tanpa mencabik sentuh jemarimu. "
    "Tersumbat katupnya jika sedetik saja tak menjerat hangat pelukmu. "
    "Karena ku penjarakan kamu di dalamnya, "
    "terkurung di balik serambi kananku. "
    "Inginku kamu tak akan bebas, "
    "biar mudah aku kirimkan damba melalui nodus pengikat septumku."
    "Jika hatiku adalah rumah,"
    "maka seluruh ruangnya sudah kupenuhi olehmu."
    "Tak ada tempat untuk siapa pun lagi."
    "Bahkan mungkin, tak ada tempat untuk diriku sendiri."
    "Aku tidak ingin memilikimu sebentar."
    "Aku ingin menjadi alasan mengapa hatimu tak pernah merasa perlu mencari siapa-siapa lagi."
    "Ada sesuatu yang salah dari caraku mencintaimu."
    "Aku mulai mengingat terlalu banyak tentangmu."
    "Cara kamu tertawa, cara kamu diam, cara kamu menyebut namaku."
    "Hal-hal kecil yang seharusnya mudah dilupakan"
    "justru menetap paling lama di kepalaku."
    "Dan mungkin itu masalahnya—"
    "aku tidak hanya jatuh cinta kepadamu."
    "Aku mulai terbiasa menjadikanmu pusat dari segala sesuatu."

)
LETTER_SIGNATURE = "Selalu milikmu"
LETTER_CLOSING_QUESTION = "Jadi... maukah kamu membacanya sampai akhir?"

ENDING_HEADLINE = "Terima Kasih"
ENDING_SUBLINE = "Sudah menjadi alasan aku tersenyum, hari ini dan seterusnya."

GALLERY_QUOTE = (
    "Kamu bukan sekadar seseorang yang aku cintai."
    "Kamu sudah menjadi kebiasaan yang terlalu dalam untuk kuhentikan."
)

FLOWER_TITLE_PREFIX = "Bunga untuk"
FLOWER_TITLE_SCRIPT = "orang favoritku"
FLOWER_DESCRIPTION = (
    "Aku tidak lagi ingin sekadar mencintaimu."
    "Aku ingin namamu menetap di setiap bagian dari diriku,"
    "sampai aku sendiri lupa bagaimana rasanya hidup tanpa memikirkanmu."
)

MUSIC_HERO_LABEL = "grande - tatooes heart"
MUSIC_HERO_CAPTION = "Lagu untuk kita berdua"
MUSIC_PHOTOS = ["track1.JPEG", "track2.JPEG"]

GALLERY_DIR = os.path.join(app.root_path, "static", "gallery")


def load_gallery_files():
    try:
        os.makedirs(GALLERY_DIR, exist_ok=True)
        return sorted(
            f for f in os.listdir(GALLERY_DIR)
            if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
        )
    except OSError:
        return []


GALLERY_FILES = load_gallery_files()


@app.route("/")
def index():
    letter_data = json.dumps({
        "title": LETTER_TITLE,
        "subtitle": LETTER_SUBTITLE,
        "body": LETTER_BODY,
        "signature": LETTER_SIGNATURE,
        "closingQuestion": LETTER_CLOSING_QUESTION,
        "recipient": RECIPIENT_NAME,
        "endingHeadline": ENDING_HEADLINE,
        "endingSubline": ENDING_SUBLINE,
        "passwordClue": PASSWORD_CLUE,
        "galleryQuote": GALLERY_QUOTE,
        "flowerTitlePrefix": FLOWER_TITLE_PREFIX,
        "flowerTitleScript": FLOWER_TITLE_SCRIPT,
        "flowerDescription": FLOWER_DESCRIPTION,
        "musicHeroLabel": MUSIC_HERO_LABEL,
        "musicHeroCaption": MUSIC_HERO_CAPTION,
        "musicPhotos": MUSIC_PHOTOS,
    })
    return render_template(
        "index.html",
        recipient=RECIPIENT_NAME,
        letter_data=letter_data,
    )


@app.route("/api/check-password", methods=["POST"])
def check_password():
    data = request.get_json(silent=True) or {}
    entered = str(data.get("password", "")).strip()

    if entered == PASSWORD:
        session["unlocked"] = True
        return jsonify({"success": True})
    return jsonify({"success": False, "clue": PASSWORD_CLUE}), 401


@app.route("/api/gallery")
def gallery():
    files = [f"/static/gallery/{f}" for f in load_gallery_files()]
    return jsonify({"images": files})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
