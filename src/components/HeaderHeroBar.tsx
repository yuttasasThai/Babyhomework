{/* ปุ่มแอดมิน & ลิงก์ User (กดเพื่อสร้างลิงก์กำหนดวันหมดอายุ และโหลด Source) */}
            {onOpenShareLink && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playStarPop();
                  onOpenShareLink();
                }}
                title="สร้างลิงก์ User กำหนดวันหมดอายุ & ระบบแอดมิน"
                className="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/25 active:scale-95"
              >
                <span>🔑</span>
                <span>แอดมิน</span>
              </button>
            )}
