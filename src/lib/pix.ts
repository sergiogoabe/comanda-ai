import QRCode from "qrcode";

export interface PIXData {
  qrCode: string;
  code: string;
  amount: number;
  merchantName: string;
}

export function generatePIXQRCode(amount: number, merchantName: string): PIXData {
  const pixKey = "00020126520014br.gov.bcb.pix2555@comandaai.com.br520400005303986540"
    .replace("@comandaai.com.br", "")
    .substring(0, 25);

  const merchantNameFormatted = merchantName.toUpperCase().slice(0, 25).padEnd(25, " ");

  const gui = "010211";
  const key = "0014br.gov.bcb.pix";
  const merchantAccountInfo = `${gui}${key}01${pixKey.padEnd(25, " ")}`;
  const merchantCategoryCode = "0000";
  const transactionCurrency = "986";
  const transactionAmount = amount.toFixed(2);
  const countryCode = "BR";
  const merchantCity = "SAO PAULO";
  const txid = "COMANDAI" + Math.random().toString(36).substring(2, 7).toUpperCase();

  const additionalDataFieldTemplate = `05${txid.padEnd(25, " ")}`;
  
  const payloadFormatIndicator = "01";
  const pointOfInitializationMethod = "12";
  const merchantAccountInfoLength = merchantAccountInfo.length.toString().padStart(2, "0");
  const merchantAccountInfoComplete = `${merchantAccountInfoLength}${merchantAccountInfo}`;
  const additionalDataFieldTemplateLength = additionalDataFieldTemplate.length.toString().padStart(2, "0");
  const additionalDataFieldTemplateComplete = `${additionalDataFieldTemplateLength}${additionalDataFieldTemplate}`;
  const merchantNameLength = merchantNameFormatted.trim().length.toString().padStart(2, "0");
  const merchantCityLength = merchantCity.length.toString().padStart(2, "0");

  const merchantInfoField = `${payloadFormatIndicator}${pointOfInitializationMethod}${merchantAccountInfoComplete}${merchantCategoryCode}${transactionCurrency}${transactionAmount}${countryCode}${merchantNameLength}${merchantNameFormatted}${merchantCityLength}${merchantCity}${additionalDataFieldTemplateComplete}6304`;

  const crc = calculateCRC16(merchantInfoField);
  const completePayload = `${merchantInfoField}${crc}`;

  const code = completePayload;

  return {
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}`,
    code,
    amount,
    merchantName,
  };
}

function calculateCRC16(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
}

export async function generateQRCodeImage(data: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

export function validatePIXCode(code: string): boolean {
  if (!code || code.length < 50) return false;
  if (!code.startsWith("000201")) return false;
  if (!code.endsWith("6304")) return false;
  return true;
}