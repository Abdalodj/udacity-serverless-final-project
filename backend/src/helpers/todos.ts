import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()
const logger = createLogger('TodoLogic')

// TODO: Implement businessLogic

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  try {
    logger.info('createTodo businessLogic')
    const itemId = uuid.v4()

    const result = await todosAccess.createTodoItem({
      todoId: itemId,
      userId: userId,
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      done: false,
      attachmentUrl: attachmentUtils.getAttachmentUrl(itemId, userId),
      createdAt: new Date().toISOString()
    })
    return { ...result }
  } catch (err) {
    logger.error('Error createTodo businessLogic', { error: err })
    throw createError(err)
  }
}

export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  userId: string
): Promise<TodoItem> {
  try {
    logger.info('updateTodo businessLogic')

    await todosAccess.updateTodoItem(todoId, userId, updateTodoRequest)

    const newItem = todosAccess.getTodoItem(todoId, userId)
    return newItem
  } catch (err) {
    logger.error('Error updateTodo businessLogic', { error: err })
    throw createError(err)
  }
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  try {
    logger.info('getTodosForUser businessLogic')
    const result = todosAccess.getTodoItemsByUserId(userId)
    return result
  } catch (err) {
    logger.error('Error getTodosForUser businessLogic', { error: err })
    throw createError(err)
  }
}

export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<TodoItem> {
  try {
    logger.info('deleteTodo businessLogic')
    const resut = await todosAccess.deleteTodoItem(todoId, userId)
    return resut
  } catch (err) {
    logger.error('Error deleteTodo businessLogic', { error: err })
    throw createError(err)
  }
}

export function createAttachmentPresignedUrl(
  todoId: string,
  userId: string
): string {
  try {
    logger.info('createAttachmentPresignedUrl businessLogic')
    return attachmentUtils.getUploadUrl(todoId, userId)
  } catch (err) {
    logger.error('Error createAttachmentPresignedUrl businessLogic', {
      error: err
    })
    throw createError(err)
  }
}
