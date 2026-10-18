import { Stack, Box, Text, Title, Card } from '@mantine/core'
import type { ReactNode, FC } from 'react'

interface PagePlaceholderProps {
	title: string
	description: string
	children?: ReactNode
}

export const PagePlaceholder: FC<PagePlaceholderProps> = ({
	title,
	description,
	children,
}) => (
	<Stack gap="lg">
		<Box>
			<Title order={2}>{title}</Title>
			<Text c="dimmed" mt="xs">
				{description}
			</Text>
		</Box>

		<Card withBorder radius="md" p="lg">
			<Stack gap="md">
				{children ?? (
					<Text c="dimmed">TODO: реализовать страницу и подключить API.</Text>
				)}
			</Stack>
		</Card>
	</Stack>
)
