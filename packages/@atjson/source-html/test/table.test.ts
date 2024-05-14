import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";
import { serialize } from "@atjson/document";

describe("Table", () => {
  describe("valid tables", () => {
    test("converts simple tables", () => {
      let tableMarkup = `
<table>
  <thead>
    <tr>
      <th>name</th>
      <th>age</th>
      <th>job</th>
      <th>
        <a href="https://en.wikipedia.org/wiki/Delicious_in_Dungeon">
          <em>notes</em>
        </a>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>laios</td>
      <td>20</td>
      <td>fighter</td>
      <td>
        A strange but earnest person. He
        <em>really <strong>really</strong></em> likes monsters
      </td>
    </tr>
    <tr>
      <td>marcille</td>
      <td>500</td>
      <td>mage</td>
      <td>
        Difficult to get along with but very competent. Despite seeming strict
        and fussy, she is interested in forbidden magic...
      </td>
    </tr>
    <tr>
      <td>falin</td>
      <td>18</td>
      <td>healer</td>
      <td>
        She <em>seems</em> nice, but is actually just a people pleaser. When
        push comes to shove she will look out for people she loves and disregard
        strangers
      </td>
    </tr>
    <tr>
      <td>chilchuk</td>
      <td>29</td>
      <td>thief</td>
      <td>
        Looks like a child but is actually a divorced father of three. He is
        serious about his work and isn&apos;t interested in getting close with
        people
      </td>
    </tr>
  </tbody>
</table>
    `;

      expect(
        serialize(HTMLSource.fromRaw(tableMarkup).convertTo(OffsetSource), {
          withStableIds: true,
        })
      ).toMatchSnapshot();
    });

    test("converts uniform tables with no head section", () => {
      let tableMarkup = `
<table>
  <tbody>
    <tr>
      <td>laios</td>
      <td>20</td>
      <td>fighter</td>
      <td>
        A strange but earnest person. He
        <em>really <strong>really</strong></em> likes monsters
      </td>
    </tr>
    <tr>
      <td>marcille</td>
      <td>500</td>
      <td>mage</td>
      <td>
        Difficult to get along with but very competent. Despite seeming strict
        and fussy, she is interested in forbidden magic...
      </td>
    </tr>
    <tr>
      <td>falin</td>
      <td>18</td>
      <td>healer</td>
      <td>
        She <em>seems</em> nice, but is actually just a people pleaser. When
        push comes to shove she will look out for people she loves and disregard
        strangers
      </td>
    </tr>
    <tr>
      <td>chilchuk</td>
      <td>29</td>
      <td>thief</td>
      <td>
        Looks like a child but is actually a divorced father of three. He is
        serious about his work and isn&apos;t interested in getting close with
        people
      </td>
    </tr>
  </tbody>
</table>
    `;

      expect(
        serialize(HTMLSource.fromRaw(tableMarkup).convertTo(OffsetSource), {
          withStableIds: true,
        })
      ).toMatchSnapshot();
    });

    test("converts jagged tables with no head section", () => {
      let tableMarkup = `
<table>
  <tbody>
    <tr>
      <td>laios</td>
    </tr>
    <tr>
      <td>marcille</td>
      <td>500</td>
      <td>mage</td>
    </tr>
    <tr>
      <td>falin</td>
      <td>healer</td>
    </tr>
    <tr>
      <td>chilchuk</td>
      <td>29</td>
      <td>thief</td>
      <td>
        Looks like a child but is actually a divorced father of three. He is
        serious about his work and isn&apos;t interested in getting close with
        people
      </td>
    </tr>
  </tbody>
</table>
    `;

      expect(
        serialize(HTMLSource.fromRaw(tableMarkup).convertTo(OffsetSource), {
          withStableIds: true,
        })
      ).toMatchSnapshot();
    });

    test("converts column alignments", () => {
      let tableMarkup = `
<table>
  <thead>
    <tr>
      <th style="text-align: left;">name</th>
      <th>age</th>
      <th>job</th>
      <th style="text-align: right;">
        <a href="https://en.wikipedia.org/wiki/Delicious_in_Dungeon">
          <em>notes</em>
        </a>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>laios</td>
      <td>20</td>
      <td>fighter</td>
      <td>
        A strange but earnest person. He
        <em>really <strong>really</strong></em> likes monsters
      </td>
    </tr>
    <tr>
      <td>marcille</td>
      <td>500</td>
      <td>mage</td>
      <td>
        Difficult to get along with but very competent. Despite seeming strict
        and fussy, she is interested in forbidden magic...
      </td>
    </tr>
    <tr>
      <td>falin</td>
      <td>18</td>
      <td>healer</td>
      <td>
        She <em>seems</em> nice, but is actually just a people pleaser. When
        push comes to shove she will look out for people she loves and disregard
        strangers
      </td>
    </tr>
    <tr>
      <td>chilchuk</td>
      <td>29</td>
      <td>thief</td>
      <td>
        Looks like a child but is actually a divorced father of three. He is
        serious about his work and isn&apos;t interested in getting close with
        people
      </td>
    </tr>
  </tbody>
</table>
    `;

      expect(
        serialize(HTMLSource.fromRaw(tableMarkup).convertTo(OffsetSource), {
          withStableIds: true,
        })
      ).toMatchSnapshot();
    });
  });

  describe("invalid tables", () => {
    test("does not convert tables with multiple head sections", () => {
      let tableMarkup = `
<table>
  <thead>
    <tr>
      <th>name</th>
      <th>age</th>
      <th>job</th>
      <th>
        <a href="https://en.wikipedia.org/wiki/Delicious_in_Dungeon">
          <em>notes</em>
        </a>
      </th>
    </tr>
  </thead>
  <thead>
    <tr>
      <th>name</th>
      <th>age</th>
      <th>job</th>
      <th>
        <a href="https://en.wikipedia.org/wiki/Delicious_in_Dungeon">
          <em>notes</em>
        </a>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>laios</td>
      <td>20</td>
      <td>fighter</td>
      <td>
        A strange but earnest person. He
        <em>really <strong>really</strong></em> likes monsters
      </td>
    </tr>
    <tr>
      <td>marcille</td>
      <td>500</td>
      <td>mage</td>
      <td>
        Difficult to get along with but very competent. Despite seeming strict
        and fussy, she is interested in forbidden magic...
      </td>
    </tr>
    <tr>
      <td>falin</td>
      <td>18</td>
      <td>healer</td>
      <td>
        She <em>seems</em> nice, but is actually just a people pleaser. When
        push comes to shove she will look out for people she loves and disregard
        strangers
      </td>
    </tr>
    <tr>
      <td>chilchuk</td>
      <td>29</td>
      <td>thief</td>
      <td>
        Looks like a child but is actually a divorced father of three. He is
        serious about his work and isn&apos;t interested in getting close with
        people
      </td>
    </tr>
  </tbody>
</table>
    `;

      expect(
        serialize(HTMLSource.fromRaw(tableMarkup).convertTo(OffsetSource), {
          withStableIds: true,
        })
      ).toMatchSnapshot();
    });

    test("does not convert tables with multiple heading rows", () => {
      let tableMarkup = `
<table>
  <thead>
    <tr>
      <th>name</th>
      <th>age</th>
      <th>job</th>
      <th>
        <a href="https://en.wikipedia.org/wiki/Delicious_in_Dungeon">
          <em>notes</em>
        </a>
      </th>
    </tr>
    <tr>
      <th>name</th>
      <th>age</th>
      <th>job</th>
      <th>
        <a href="https://en.wikipedia.org/wiki/Delicious_in_Dungeon">
          <em>notes</em>
        </a>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>laios</td>
      <td>20</td>
      <td>fighter</td>
      <td>
        A strange but earnest person. He
        <em>really <strong>really</strong></em> likes monsters
      </td>
    </tr>
    <tr>
      <td>marcille</td>
      <td>500</td>
      <td>mage</td>
      <td>
        Difficult to get along with but very competent. Despite seeming strict
        and fussy, she is interested in forbidden magic...
      </td>
    </tr>
    <tr>
      <td>falin</td>
      <td>18</td>
      <td>healer</td>
      <td>
        She <em>seems</em> nice, but is actually just a people pleaser. When
        push comes to shove she will look out for people she loves and disregard
        strangers
      </td>
    </tr>
    <tr>
      <td>chilchuk</td>
      <td>29</td>
      <td>thief</td>
      <td>
        Looks like a child but is actually a divorced father of three. He is
        serious about his work and isn&apos;t interested in getting close with
        people
      </td>
    </tr>
  </tbody>
</table>
    `;

      expect(
        serialize(HTMLSource.fromRaw(tableMarkup).convertTo(OffsetSource), {
          withStableIds: true,
        })
      ).toMatchSnapshot();
    });
  });
});
