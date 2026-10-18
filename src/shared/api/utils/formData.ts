export const toFormData = (data: Record<string, unknown>): FormData => {
	const formData = new FormData()

	for (const [key, value] of Object.entries(data)) {
		if (value === null || value === undefined) {
			continue
		}

		if (value instanceof Blob) {
			formData.append(key, value)
			continue
		}

		if (Array.isArray(value)) {
			for (const item of value) {
				if (item === null || item === undefined) {
					continue
				}

				if (item instanceof Blob) {
					formData.append(key, item)
				} else if (typeof item === 'object') {
					formData.append(key, JSON.stringify(item))
				} else {
					formData.append(key, String(item))
				}
			}

			continue
		}

		if (typeof value === 'object') {
			formData.append(key, JSON.stringify(value))
			continue
		}

		formData.append(key, String(value))
	}

	return formData
}
