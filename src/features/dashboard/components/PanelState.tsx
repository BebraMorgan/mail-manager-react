import { Center, Skeleton, Stack, Text } from '@mantine/core'

export function PanelSkeleton({ rows = 3 }: { rows?: number }) {
	return (
		<Stack gap="md" py="sm">
			{Array.from({ length: rows }, (_, i) => (
				<Skeleton
					key={i}
					height={i === 0 ? 28 : 18}
					radius="sm"
					width={i === 0 ? '60%' : '100%'}
				/>
			))}
		</Stack>
	)
}

export function PanelEmpty({ message }: { message: string }) {
	return (
		<Center py="xl" mih={110}>
			<Text c="dimmed" size="sm" ta="center">
				{message}
			</Text>
		</Center>
	)
}
