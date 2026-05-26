/**
 * lib/errors.ts — Erros tipados e handler centralizado
 * Segue RFC 7807 Problem Details for HTTP APIs
 */
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Erros pré-definidos comuns
export const Errors = {
  UNAUTHENTICATED: () => new ApiError(401, 'UNAUTHENTICATED', 'Autenticação necessária'),
  FORBIDDEN:       (msg = 'Acesso negado') => new ApiError(403, 'FORBIDDEN', msg),
  NOT_FOUND:       (resource: string) => new ApiError(404, 'NOT_FOUND', `${resource} não encontrado`),
  CONFLICT:        (msg: string, details?: unknown) => new ApiError(409, 'CONFLICT', msg, details),
  UNPROCESSABLE:   (msg: string, details?: unknown) => new ApiError(422, 'UNPROCESSABLE', msg, details),
  RATE_LIMITED:    () => new ApiError(429, 'RATE_LIMITED', 'Muitas requisições. Aguarde antes de tentar novamente.'),
  INTERNAL:        () => new ApiError(500, 'INTERNAL_ERROR', 'Erro interno do servidor'),
}

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code:    'VALIDATION_ERROR',
          message: 'Dados inválidos',
          issues:  err.issues.map(i => ({
            field:   i.path.join('.'),
            message: i.message,
          })),
        },
      },
      { status: 422 },
    )
  }

  if (err instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code:    err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
        },
      },
      { status: err.status },
    )
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const fields = Array.isArray(err.meta?.target) ? (err.meta.target as string[]) : []
    if (fields.includes('phone')) {
      return NextResponse.json(
        {
          error: {
            code:    'CONFLICT',
            message: 'Já existe um contato com este telefone',
            details: { field: 'phone' },
          },
        },
        { status: 409 },
      )
    }
    return NextResponse.json(
      {
        error: {
          code:    'CONFLICT',
          message: 'Registro duplicado',
          details: { fields },
        },
      },
      { status: 409 },
    )
  }

  // Erro desconhecido — logar sem expor detalhes
  console.error('[unhandled error]', err)
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
    { status: 500 },
  )
}