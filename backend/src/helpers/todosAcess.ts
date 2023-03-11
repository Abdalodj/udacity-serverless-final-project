import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly tableIndex = process.env.TODOS_CREATED_AT_INDEX,
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async createTodoItem(todo: TodoItem): Promise<TodoItem> {
    logger.info('Create Todo items')
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

    return todo
  }

  async updateTodoItem(
    todoId: string,
    userId: string,
    todo: UpdateTodoRequest
  ): Promise<TodoUpdate> {
    logger.info('Update TodoItem: ' + todoId + ' For user: ' + userId)
    const result = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': todo.name,
          ':dueDate': todo.dueDate,
          ':done': todo.done
        },
        ReturnValues: 'ALL_NEW'
      })
      .promise()

    return result.Attributes as TodoUpdate
  }

  async getTodoItemsByUserId(userId: string): Promise<TodoItem[]> {
    logger.info('Get Todo item list for the user: ' + userId)
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.tableIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: true
      })
      .promise()

    return result.Items as TodoItem[]
  }

  async getTodoItem(todoId: string, userId: string): Promise<TodoItem> {
    logger.info('Get Todo item for the user: ' + userId)
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      })
      .promise()

    return (result.Item as TodoItem) ?? null
  }

  async deleteTodoItem(todoId: string, userId: string): Promise<TodoItem> {
    logger.info('Delete TodoItem: ' + todoId + ' for user: ' + userId)
    const result = await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        ReturnValues: 'ALL_OLD'
      })
      .promise()
    logger.info('Deleted TodoItem: ' + todoId + ' result: ', result)
    return result.Attributes as TodoItem
  }
}

function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}
