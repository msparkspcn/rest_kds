import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import './DropdownMenu.scss';
import { memo } from 'react';

function DropdownMenu({
  infoList,
  selectedInfo,
  onSelectInfo,
}: {
  infoList: { infoCd: string; infoNm: string }[];
  selectedInfo: { infoCd: string; infoNm: string };
  onSelectInfo: (item: { infoCd: string; infoNm: string }) => void;
}) {
  // console.log("DropdownMenu infoList:" + JSON.stringify(infoList)); // 전달된 infoList 확인
  console.log(`111DropdownMenu infoList[0]:${JSON.stringify(infoList[0].infoNm)}`); // 전달된 infoList 확인

  const handleSelectItem = (item: { infoCd: string; infoNm: string }) => {
    if (item.infoCd === selectedInfo.infoCd) return;
    onSelectInfo(item); // 선택된 아이템을 부모로 전달
  };
  return (
    <Menu as="div" className="menu">
      <div>
        <MenuButton className="menu-button">
          <span className="menu-selected">
            {infoList.length > 0 ? selectedInfo.infoNm : '선택하세요'}
          </span>
          <ChevronDownIcon aria-hidden="true" className="menu-icon" />
        </MenuButton>
      </div>

      <MenuItems className="menu-items" transition>
        <div className="menu-item-wrapper">
          {infoList.map((item, index) => (
            <MenuItem key={index}>
              <div className="menu-item" onClick={() => handleSelectItem(item)}>
                {item.infoNm}
              </div>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}

export default memo(DropdownMenu);
