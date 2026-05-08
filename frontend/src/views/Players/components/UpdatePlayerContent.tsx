import type { ChangeEvent, KeyboardEvent } from "react";
import { useState } from "react";
import type { Player } from "../../../../../shared/domain";
import { useAppContext } from "../../../AppContext";


export function UpdatePlayerModal({ player }: {
  player: Player;
}) {
  const { send, setModalContent } = useAppContext();

  const [updatedPlayer, setUpdatedPlayer] = useState<Player>(player);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setUpdatedPlayer({ ...updatedPlayer, name: event.target.value });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave();
    }
  }
  function handleSave() {
    send(['updatePlayer', { player: updatedPlayer }]);
    setModalContent(null);
  }

  function handleToggleActive() {
    setUpdatedPlayer({ ...updatedPlayer, deactivated: !updatedPlayer.deactivated });
  }
  return (
    <update-player>
      <update-player-heading>Update Player</update-player-heading>
      <update-player-content >
        <fields-container>
          <field-group>
            <field-label>Player ID</field-label>
            <field-value>
              {updatedPlayer.id} </field-value>
          </field-group>
          <field-group>
            <field-label>Name</field-label>
            <field-value>
              <input type="text" value={updatedPlayer.name}
                onChange={handleChange} />
            </field-value>
          </field-group>
          <field-group>
            <field-label>Deactivated</field-label>
            <field-value>
              <input type="checkbox" checked={updatedPlayer.deactivated}
                onKeyDown={handleKeyDown} onChange={handleToggleActive} />
            </field-value>
          </field-group>
        </fields-container>
      </update-player-content>
      <update-player-actions><button className={updatedPlayer.deactivated ? "active" : "danger"} onClick={handleToggleActive}>
        {updatedPlayer.deactivated ? "Activate Player" : "Deactivate Player"}
      </button><button className="active" onClick={handleSave}>
          Save
        </button></update-player-actions>
    </update-player>
  );
}
