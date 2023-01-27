export interface ResGBPayQuery {
    resultCode: string;
    txn: ResGBPayQueryTxn;
    resultMessage: string;
}

export interface ResGBPayQueryTxn {
    // ยังไม่มีการจ่าย
    amount: string;
    referenceNo: string;
    gbpReferenceNo: string;
    merchantDefined5: string;
    merchantDefined3: string;
    merchantDefined4: string;
    merchantDefined1: string;
    status: string;
    paymentType: string;
    merchantDefined2: string;

    // ------------------------------
    // ถ้ามีการจ่าย จะมีข้อมูลด่นล่างเพิ่มเข้าไป ด้วย
    date?: string;

    // 00	Success
    // 11	Invalid referenceNo
    // 12	Invalid gbpReferenceNo
    // 14	Invalid amount
    // 21	Duplicate transaction
    // 22	Over due
    // 99	System error
    resultCode?: string;
    totalAmount?: string;
    thbAmount?: string;
    time?: string;
    currencyCode?: string;
}
