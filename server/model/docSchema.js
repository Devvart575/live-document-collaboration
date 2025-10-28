import mongoose from "mongoose";

const docSchema = new mongoose.Schema({
    room : {
        type : String,
        required : true,
        unique : true
    },

    content : {
        type : String,
        default : ""
    },

})

export const Document = mongoose.model("Document", docSchema)