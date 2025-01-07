import {Schema, model} from 'mongoose'

interface IComment {
    name: string,
    endDate: string
}

const CommentSchema = new Schema<IComment>({
    name: String,
    endDate: String
})

export default model<IComment>('Comment', CommentSchema)