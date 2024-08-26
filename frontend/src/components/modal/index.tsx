import React, { useCallback, useMemo, useState } from "react";

export function useModal() {
	const [open, setOpen] = useState(false);

	const closeModal = () => {
		setOpen(false);
	};
	const openModal = () => {
		setOpen(true);
	};

	const Modal = useCallback(
		({
			children,
			title,
		}: {
			children: React.ReactNode;
			title?: string;
		}) => {
			return (
				<>
					{open && (
						<div
							className="main-modal fixed w-full h-100 inset-0 z-50 overflow-y-scroll flex justify-center items-center animated fadeIn faster"
							style={{ background: "rgba(0,0,0,.7)" }}
						>
							<div className="border border-teal-500 modal-container bg-white w-11/12 md:max-w-[600px] mx-auto rounded shadow-lg z-50 overflow-y-auto">
								<div className="modal-content py-4 text-left px-6">
									<div className="flex justify-between items-center pb-3">
										<p className="text-2xl font-bold capitalize">
											{title}
										</p>
										<div
											className="modal-close cursor-pointer z-50"
											onClick={closeModal}
										>
											<svg
												className="fill-current text-black"
												xmlns="http://www.w3.org/2000/svg"
												width="18"
												height="18"
												viewBox="0 0 18 18"
											>
												<path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
											</svg>
										</div>
									</div>
									{children}
								</div>
							</div>
						</div>
					)}
				</>
			);
		},
		[open]
	);

	return {
		Modal,
		openModal,
		closeModal,
	};
}
