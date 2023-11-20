import { WhereOperator } from "../enums/where-operator.enum"

export const whereOperatorKeySuffix: Record<WhereOperator, string> = {
  [WhereOperator.Equal]: "",
  [WhereOperator.NotEqual]: "_ne",
  [WhereOperator.GreaterThan]: "_gt",
  [WhereOperator.GreaterThanOrEqual]: "_gte",
  [WhereOperator.LessThan]: "_lt",
  [WhereOperator.LessThanOrEqual]: "_lte",
  [WhereOperator.Like]: "_like",
  [WhereOperator.In]: "_in",
}
