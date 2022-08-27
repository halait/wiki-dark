export interface WikiPreview {
    type: string;
    titles: {
        canonical: string,
        normalized: string
    }
    thumbnail: {
        source: string,
        width: number,
        height: number
    },
    description: string,
    extract: string
}