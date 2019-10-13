export class Question {
  constructor({id, name, number, description, answer, newAnswer,content, saveStatus,compileStatus,debugStatus }) {
    this.id = id
    this.name = name
    this.number = number
    this.description = description
    this.answer = answer
    this.newAnswer = newAnswer
    this.content = content
    this.saveStatus = saveStatus
    this.compileStatus = compileStatus
    this.debugStatus = debugStatus
  }
}

export class DebugReq {
  constructor(bp,questionFullName) {
    this.bp = bp
    this.questionFullName = questionFullName
  }
}