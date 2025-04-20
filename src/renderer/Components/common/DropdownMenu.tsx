import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import './DropdownMenu.scss';

export default function DropdownMenu(
    {infoList}: {
    infoList: { infoCd: string, infoNm: string }[]; // infoList 배열을 받는 형태로 수정
}) {
    console.log("DropdownMenu infoList:" + JSON.stringify(infoList)); // 전달된 infoList 확인
    // const [selectedItem, setSelectedItem] = useState(infoList[0]);
    // const handleSelectItem = (item: { infoCd: string, infoNm: string }) => {
    //     setSelectedItem(item);
    // };
    return (
      <Menu as="div" className="menu">
        <div>
          <MenuButton className="menu-button">
            <span className="menu-selected">{infoList[0].infoNm}</span>
            <ChevronDownIcon aria-hidden="true" className="menu-icon" />
          </MenuButton>
        </div>

        <MenuItems className="menu-items" transition>
          <div className="menu-item-wrapper">
            {infoList.map(({ infoNm }, index) => (
              <MenuItem key={index}>
                <div className="menu-item">
                  {infoNm}
                </div>
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>

    )
}
