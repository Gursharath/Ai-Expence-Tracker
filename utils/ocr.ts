import Tesseract from "tesseract.js"

export async function extractReceiptText(
    file: File
) {
    try {
        const result =
            await Tesseract.recognize(
                file,
                "eng",
                {
                    logger: (m) =>
                        console.log(m),
                }
            )

        return result.data.text
    } catch (error) {
        console.error(error)

        return ""
    }
}