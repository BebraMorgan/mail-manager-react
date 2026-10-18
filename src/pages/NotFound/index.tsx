import type { FC } from 'react'
import { PagePlaceholder } from '../PagePlaceholder'
import { Button } from '@mantine/core'
import { Link } from 'react-router-dom'

export const NotFoundPage: FC = () => (
	<PagePlaceholder
		title="Страница не найдена"
		description="Указанный адрес не существует."
	>
		<Button component={Link} to="/" variant="light">
			На главную
		</Button>
	</PagePlaceholder>
)
