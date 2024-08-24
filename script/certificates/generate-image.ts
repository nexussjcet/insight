import Jimp from "jimp";
import QRCode from 'qrcode'
import JsonData from "@/script/certificates/out.json";
import { dataZod } from "@/script/validation";

const parentFolder = "./script/certificates"

const template1 = (templateImage:Jimp) => ({
    image: {
        x: 0, y: 1024 + 34, // position
        maxX: templateImage.getWidth(),
        maxY: 0 // size
    }, 
    qr: {
        getX: (qrImage:Jimp) => templateImage.getWidth() - qrImage.getWidth() - 75,
        getY: (qrImage:Jimp) => 75 // position
    }
})
const template2 = (templateImage:Jimp) => ({
    image: {
        x: templateImage.getWidth() / 2, y: 30, // position
        maxY: templateImage.getHeight(),
        maxX: templateImage.getWidth() / 2// size
    }, 
    qr: {
        getX: (qrImage:Jimp) => 30, // position
        getY: (qrImage:Jimp) => templateImage.getHeight() - qrImage.getHeight() - 30
    }
})


const data = dataZod.parse(JsonData)
const eventId = "insendium-24"

const fileName = `${eventId}.png` // 'template1.png'
const templateImage = await Jimp.read(`${parentFolder}/resources/${fileName}`)
const template = template1(templateImage) // template1(templateImage)

const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)


// biome-ignore lint/complexity/noForEach: <explanation>
data.forEach(async d => {
    const qrBuffer = await QRCode.toBuffer(d.token)

    templateImage.print(font, template.image.x, template.image.y,
        {
            text: d.name,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        },
        template.image.maxX, template.image.maxY
    );

    const qrImage = await Jimp.read(qrBuffer);
    templateImage.blit(qrImage, template.qr.getX(qrImage) , template.qr.getY(qrImage));

    const certificate = `${parentFolder}/${eventId}/${d.email}.${templateImage.getExtension()}`;
    const done = await templateImage.writeAsync(certificate);
})