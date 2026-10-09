/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

export class OrganizationUserRemovedEvent {
  constructor(
    public readonly userId: string,
    public readonly organizationId: string,
  ) {}
}
