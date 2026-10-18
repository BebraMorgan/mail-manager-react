import type { FC } from 'react'
import { PagePlaceholder } from '../PagePlaceholder'
import { Link } from 'react-router-dom'
import { Button } from '@mantine/core'

export const ForbiddenPage: FC = () => (
	<PagePlaceholder
		title="Доступ запрещён"
		description="У вашей учётной записи недостаточно прав."
	>
		<Button component={Link} to="/" variant="light">
			На главную
		</Button>
	</PagePlaceholder>
)
