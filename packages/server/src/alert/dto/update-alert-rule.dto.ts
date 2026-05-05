/**
 * 更新告警规则 DTO
 * Update Alert Rule DTO
 * アラートルール更新 DTO
 * 更新告警規則 DTO
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateAlertRuleDto } from './create-alert-rule.dto';

export class UpdateAlertRuleDto extends PartialType(CreateAlertRuleDto) {}
