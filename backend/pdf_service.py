import fitz
import pytesseract

from PIL import Image, ImageOps, ImageEnhance
from pytesseract import Output


# =========================================================
# OCR IMAGE PREPARATION
# =========================================================

def render_page_as_image(page):
    """
    Convert a PDF page into a high-resolution image
    suitable for OCR.
    """

    pixmap = page.get_pixmap(
        matrix=fitz.Matrix(3, 3),
        alpha=False
    )

    image = Image.frombytes(
        "RGB",
        [pixmap.width, pixmap.height],
        pixmap.samples
    )

    return image


def prepare_image_for_ocr(image):
    """
    Improve scanned document quality before OCR.
    """

    # Convert to grayscale
    image = ImageOps.grayscale(image)

    # Increase contrast
    image = ImageEnhance.Contrast(
        image
    ).enhance(2.0)

    # Slightly sharpen
    image = ImageEnhance.Sharpness(
        image
    ).enhance(2.0)

    return image


# =========================================================
# OCR PAGE
# =========================================================

def ocr_page(page):
    """
    OCR a scanned PDF page and return plain text.
    """
    try:
        image = render_page_as_image(page)
        image = prepare_image_for_ocr(image)
        text = pytesseract.image_to_string(image, config="--psm 6")
        return text.strip()
    except Exception as err:
        print(f"OCR page warning: {type(err).__name__} - {err}")
        return ""


# =========================================================
# OCR PAGE WITH POSITIONS
# =========================================================

def ocr_page_with_positions(page):
    """
    OCR a scanned page while preserving word positions.

    This is important because the biomarker parser needs
    to understand which value belongs to which test.
    """
    try:
        image = render_page_as_image(page)
        image = prepare_image_for_ocr(image)
        data = pytesseract.image_to_data(
            image,
            output_type=Output.DICT,
            config="--psm 6"
        )
    except Exception as err:
        print(f"OCR word positions warning: {type(err).__name__} - {err}")
        return []

    words = []

    scale_x = page.rect.width / image.width
    scale_y = page.rect.height / image.height

    total_items = len(
        data["text"]
    )

    for i in range(total_items):

        text = data["text"][i].strip()

        if not text:
            continue

        try:
            confidence = float(
                data["conf"][i]
            )
        except Exception:
            confidence = 0


        # Ignore extremely poor OCR results
        if confidence < 20:
            continue


        x = data["left"][i]
        y = data["top"][i]
        width = data["width"][i]
        height = data["height"][i]


        # Convert image coordinates back
        # into PDF coordinates
        x0 = x * scale_x
        y0 = y * scale_y

        x1 = (
            x + width
        ) * scale_x

        y1 = (
            y + height
        ) * scale_y


        block_number = (
            data["block_num"][i]
        )

        paragraph_number = (
            data["par_num"][i]
        )

        line_number = (
            data["line_num"][i]
        )

        word_number = (
            data["word_num"][i]
        )


        words.append({

            "text":
                text,

            "x0":
                x0,

            "y0":
                y0,

            "x1":
                x1,

            "y1":
                y1,

            "block":
                block_number,

            "paragraph":
                paragraph_number,

            "line":
                line_number,

            "word":
                word_number,

            "confidence":
                confidence
        })


    return words


# =========================================================
# NORMAL PDF TEXT EXTRACTION + OCR FALLBACK
# =========================================================

def extract_text_from_pdf(file_path):

    extracted_pages = []

    document = fitz.open(
        file_path
    )


    for page_number, page in enumerate(
        document
    ):

        # Try normal PDF text extraction first
        text = page.get_text(
            "text"
        ).strip()


        # If there is little/no text,
        # treat page as scanned and OCR it.
        if len(text) < 50:

            print(
                f"OCR applied to page "
                f"{page_number + 1}"
            )

            text = ocr_page(
                page
            )


        if text:

            extracted_pages.append({

                "page":
                    page_number + 1,

                "text":
                    text
            })


    document.close()


    combined_text = "\n\n".join(

        page["text"]

        for page in extracted_pages
    )


    return combined_text


# =========================================================
# NORMAL PDF WORD EXTRACTION
# =========================================================

def extract_words_with_positions(
    file_path
):

    document = fitz.open(
        file_path
    )

    pages = []


    for page_number, page in enumerate(
        document
    ):

        # Try native PDF text
        words = page.get_text(
            "words"
        )


        # -------------------------------------------------
        # SCANNED PAGE
        # -------------------------------------------------

        if len(words) < 5:

            print(
                f"OCR structured extraction "
                f"applied to page "
                f"{page_number + 1}"
            )

            words = ocr_page_with_positions(
                page
            )


        else:

            page_words = []

            for word in words:

                x0 = word[0]
                y0 = word[1]
                x1 = word[2]
                y1 = word[3]

                text = word[4]

                block_number = word[5]
                line_number = word[6]
                word_number = word[7]


                page_words.append({

                    "text":
                        text,

                    "x0":
                        x0,

                    "y0":
                        y0,

                    "x1":
                        x1,

                    "y1":
                        y1,

                    "block":
                        block_number,

                    "paragraph":
                        0,

                    "line":
                        line_number,

                    "word":
                        word_number,

                    "confidence":
                        100
                })


            words = page_words


        pages.append({

            "page":
                page_number + 1,

            "width":
                page.rect.width,

            "height":
                page.rect.height,

            "words":
                words
        })


    document.close()

    return pages


# =========================================================
# RECONSTRUCT OCR WORDS INTO LINES
# =========================================================

def reconstruct_lines(
    page_words
):

    if not page_words:
        return []


    sorted_words = sorted(

        page_words,

        key=lambda word: (
            word["y0"],
            word["x0"]
        )
    )


    lines = []

    current_line = []

    current_y = None


    # OCR coordinate tolerance
    Y_TOLERANCE = 6


    for word in sorted_words:

        word_y = word["y0"]


        if current_y is None:

            current_y = word_y

            current_line = [
                word
            ]

            continue


        if abs(
            word_y - current_y
        ) <= Y_TOLERANCE:

            current_line.append(
                word
            )

        else:

            current_line.sort(
                key=lambda item:
                item["x0"]
            )

            lines.append(
                current_line
            )


            current_line = [
                word
            ]

            current_y = word_y


    if current_line:

        current_line.sort(
            key=lambda item:
            item["x0"]
        )

        lines.append(
            current_line
        )


    return lines


# =========================================================
# CONVERT LINES TO TEXT
# =========================================================

def lines_to_text(
    lines
):

    output = []


    for line in lines:

        text = " ".join(

            word["text"]

            for word in line
        )


        if text.strip():

            output.append(
                text.strip()
            )


    return output


# =========================================================
# STRUCTURED PDF EXTRACTION
# =========================================================

def extract_structured_pdf(
    file_path
):

    pages = extract_words_with_positions(
        file_path
    )

    structured_pages = []


    for page in pages:

        lines = reconstruct_lines(
            page["words"]
        )


        structured_pages.append({

            "page":
                page["page"],

            "width":
                page["width"],

            "height":
                page["height"],

            "lines":
                lines
        })


    return {

        "pages":
            structured_pages
    }