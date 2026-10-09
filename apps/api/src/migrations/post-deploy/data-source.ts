/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { join } from 'path'
import { DataSource } from 'typeorm'
import { baseDataSourceOptions } from '../data-source'

const PostDeployDataSource = new DataSource({
  ...baseDataSourceOptions,
  migrations: [join(__dirname, '*-migration.{ts,js}')],
})

export default PostDeployDataSource
