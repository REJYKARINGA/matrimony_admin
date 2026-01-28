import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
    if (totalPages <= 1) return null;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            borderTop: '1px solid var(--border-color)',
            marginTop: 'auto'
        }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                        padding: '0.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.375rem',
                        background: 'var(--input-bg)',
                        color: currentPage === 1 ? 'var(--border-color)' : 'var(--text-secondary)',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <FaChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                        // Logic to show limited page numbers (start, end, current, surrounding)
                        return page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, array) => {
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                            <div key={page} style={{ display: 'flex', gap: '0.5rem' }}>
                                {showEllipsis && <span style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>...</span>}
                                <button
                                    onClick={() => onPageChange(page)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: currentPage === page ? 'none' : '1px solid var(--border-color)',
                                        borderRadius: '0.375rem',
                                        background: currentPage === page ? 'var(--primary)' : 'var(--input-bg)',
                                        color: currentPage === page ? 'white' : 'var(--text-secondary)',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {page}
                                </button>
                            </div>
                        );
                    })}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                        padding: '0.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.375rem',
                        background: 'var(--input-bg)',
                        color: currentPage === totalPages ? 'var(--border-color)' : 'var(--text-secondary)',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <FaChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
