import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
    if (totalPages <= 1) return null;

    return (
        <div className="pg-wrap">
            <style>{`
                .pg-wrap {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem;
                    border-top: 1px solid var(--border-color);
                    margin-top: auto;
                    gap: 0.75rem;
                }
                .pg-info {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                }
                .pg-buttons {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .pg-group {
                    display: flex;
                    gap: 0.5rem;
                }
                .pg-btn {
                    padding: 0.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.375rem;
                    background: var(--input-bg);
                    color: var(--text-secondary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pg-btn:disabled {
                    color: var(--border-color);
                    cursor: not-allowed;
                }
                .pg-page-btn {
                    padding: 0.5rem 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.375rem;
                    background: var(--input-bg);
                    color: var(--text-secondary);
                    font-weight: 500;
                    cursor: pointer;
                }
                .pg-page-btn.active {
                    border: none;
                    background: var(--primary);
                    color: white;
                }
                .pg-ellipsis {
                    padding: 0.5rem;
                    color: var(--text-secondary);
                }

                @media (max-width: 768px) {
                    .pg-wrap {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        gap: 0.75rem;
                    }
                    .pg-info {
                        order: 1;
                    }
                    .pg-buttons {
                        order: 2;
                        justify-content: center;
                        width: 100%;
                    }
                }
            `}</style>

            <div className="pg-info">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
            </div>

            <div className="pg-buttons">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pg-btn"
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
                            <div key={page} className="pg-group">
                                {showEllipsis && <span className="pg-ellipsis">...</span>}
                                <button
                                    onClick={() => onPageChange(page)}
                                    className={`pg-page-btn ${currentPage === page ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            </div>
                        );
                    })}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pg-btn"
                >
                    <FaChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}